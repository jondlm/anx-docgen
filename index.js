const _ = require('lodash');
const fs = require('fs');
const reactDocgen = require('react-docgen');
const recast = require('recast');

/**
 * fromPaths
 *
 * @param {string[]} paths - array of paths to your react components that should be documented
 * @return {Promise} - returns a promise that resolves with an object with all the docs
 */
function fromPaths(paths) {
	return new Promise(function(resolve, reject) {
		const docgenMap = _.reduce(paths, function(acc, path) {
			// Bail out with the error if it exists
			if (acc instanceof Error) {
				return acc;
			}

			const componentName = extractComponentName(path);
			var exportName;

			const componentSource = fs.readFileSync(path);
			const docs = reactDocgen.parse(
				componentSource,
				function resolver(ast, recast) {
					var component;
					const childComponents = [];
					const importLocalNames = [];

					recast.visit(ast, {
						visitImportDefaultSpecifier: function(path) {
							importLocalNames.push(path.value.local.name);
							return false;
						},
					});

					recast.visit(ast, {
						visitExportDefaultDeclaration: function(path) {
							const namedDefaultExport = _.get(path, 'value.declaration.name');
							// A hacky way to detect the export name of a buildHybridComponent export
							const hybridDefaultExport = _.get(path, 'value.declaration.arguments[0].name');

							exportName = namedDefaultExport || hybridDefaultExport;
							return false;
						},
					});

					recast.visit(ast, {
						visitObjectExpression: function(path) {

							path.get('properties').each(function(propertyPath) {

								// top-level component definitions
								if (propertyPath.value.key.name === 'render') {

									// main component of module
									if (findParentNodeIdentifier(path) === exportName) {
										component = path;
									} else {
										// top-level child component definitions
										childComponents.push(path);
									}
								}

								// nested child-component definitions
								if (propertyPath.value.key.name === 'components') {
									propertyPath.get('value', 'properties').each(function(childComponentPropertyPath) {
										const childComponentProperty = childComponentPropertyPath.get('value');

										// reference to an imported component
										// references to locally defined components are ignored because
										// top-level child component defs are alread resolved above
										if (childComponentProperty.value.type === 'Identifier' &&
												_.includes(importLocalNames, childComponentProperty.value.name)) {
											childComponents.push(childComponentProperty);
										}

										// reference to another component's child component
										if (childComponentProperty.value.type === 'MemberExpression') {
											childComponents.push(childComponentProperty);
										}

										// inline component definition
										if (childComponentProperty.value.type === 'CallExpression') {
											const definition = childComponentProperty.get('arguments', 0);
											childComponents.push(definition);
										}

									});
								}

							});
							return false;
						},
					});
					return [component].concat(childComponents);
				},
				[function handler(documentation, definition) {

					// component docs
					if (findParentNodeIdentifier(definition) === exportName && isTopLevelDef(definition)) {

						_.forEach(reactDocgen.defaultHandlers, function(handler) {
							handler(documentation, definition);
						});

						return recast.visit(definition, {
							visitObjectExpression: function (path) {
								const isPrivateComponent = _.chain(path.get('properties').value)
									.find(_.matchesProperty('key.name', '_isPrivate'))
									.get('value.value', false)
									.value();
								documentation.set('isPrivateComponent', isPrivateComponent);
								return false;
							},
						});

					}

					// childComponent docs

					// import reference component
					if (definition.value.type === 'Identifier') {
						documentation.set('displayName', definition.parentPath.value.key.name);
						documentation.set('description', '');
						return documentation.set('componentRef', definition.value.name);
					}

					// import reference component's child component
					if (definition.value.type === 'MemberExpression') {
						documentation.set('displayName', definition.parentPath.value.key.name);
						documentation.set('description', '');
						return documentation.set('componentRef', `${definition.value.object.name}.${definition.value.property.name}`);
					}

					// list of default handlers
					_.forEach([
						reactDocgen.handlers.propTypeHandler,
						reactDocgen.handlers.propTypeCompositionHandler,
						reactDocgen.handlers.propDocBlockHandler,
						reactDocgen.handlers.flowTypeHandler,
						reactDocgen.handlers.flowTypeDocBlockHandler,
						reactDocgen.handlers.defaultPropsHandler,
						// use normal component docblock handler for top-level defined child components,
						// otherwise this custom one
						isTopLevelDef(definition)
						? reactDocgen.handlers.componentDocblockHandler
						: function(documentation, definition) {
							const description = reactDocgen.utils.docblock.getDocblock(definition.parentPath.parentPath.parentPath) || '';
							documentation.set('description', description);
						},
						reactDocgen.handlers.displayNameHandler,
						reactDocgen.handlers.componentMethodsHandler,
						reactDocgen.handlers.componentMethodsJsDocHandler,
					], function(handler) {
						handler(documentation, definition);
					});

					documentation.set(
						'displayName',
						_.get(definition, ['parentPath', 'parentPath', 'parentPath', 'value', 'id', 'name']) ||
						_.get(definition, ['parentPath', 'parentPath', 'parentPath', 'value', 'key', 'name'])
					);

					// set propName
					definition.get('properties').each(function(property) {
						if (property.get('key', 'name').value === 'propName') {
							documentation.set('propName', property.get('value').value.value);
						}
					});

				}]
			);

			const doc = _.first(docs);
			doc.childComponents = _.tail(docs);

			// add all child components to docgen map
			_.forEach(doc.childComponents, childComponent => {
				acc[`${doc.displayName}.${childComponent.displayName}`] = childComponent;
			});

			if (!doc.description) {
				return new Error(`Missing a description from ${path} - please put a comment block right above 'createClass' and make sure to include the proper JSON blob in it.`)
			}

			// Pull out the custom json that should be in the description of every module
			const customJson = /\{.*\}/.exec(doc.description);

			// Strip out the custom json out of the description
			doc.description = doc.description.replace(/\{.*\}/, '').trim();

			if (!customJson) {
				return new Error(`Unable to find JSON in the description for ${path}. Every component must have JSON is in header with 'categories' at minimum.`);
			}

			try {
				doc.customData = JSON.parse(customJson);
			} catch(e) {
				return new Error(`Unable to parse JSON from the description of ${path}`);
			}

			return _.set(acc, componentName, doc);
		}, {});

		if (docgenMap instanceof Error) {
			return reject(docgenMap);
		}

		return resolve(docgenMap);
	});
}

function extractComponentName(path) {
	// Here's a broken down example:
	// 1) /Users/jdelamotte/dev/appnexus/lucid/src/components/Button/Button.jsx
	// 2) ["","Users","jdelamotte","dev","appnexus","lucid","src","components","Button","Button.jsx"]
	// 3) ["Button.jsx","Button","components","src","lucid","appnexus","dev","jdelamotte","Users",""]
	// 4) "Button.jsx"
	// 5) ["Button", "jsx"]
	// 6) "Button"
	return path.split('/').reverse()[0].split('.')[0];
}

function findParentNodeIdentifier(path) {
	const name = _.get(path, 'value.id.name');
	if (name) {
		return name;
	}

	if (path.parentPath) {
		return findParentNodeIdentifier(path.parentPath);
	}

	return null;
}

function isTopLevelDef(path) {
	return _.get(path, ['parentPath', 'parentPath', 'parentPath', 'parentPath', 'parentPath', 'parentPath', 'name']) === 'body';
}

module.exports = {
	fromPaths: fromPaths,
};
