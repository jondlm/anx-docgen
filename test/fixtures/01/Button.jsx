import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { lucidClassNames } from '../../util/style-helpers';
import { createClass, omitProps } from '../../util/component-types';

const cx = lucidClassNames.bind('&-Button');

const {
	arrayOf,
	bool,
	func,
	node,
	oneOf,
	oneOfType,
	string,
} = React.PropTypes;

/**
 *
 * {"categories": ["controls", "buttons"]}
 *
 * A basic button. Any props that are not explicitly called out below will be
 * passed through to the native `button` component.
 */
const Button = createClass({
	displayName: 'Button',
	propName: 'Button',
	propTypes: {
		/**
		 * disables the button by greying it out
		 */
		isDisabled: bool,
		/**
		 * activates the button by giving it a "pressed down" look
		 */
		isActive: bool,
		/**
		 * class names that are appended to the defaults
		 */
		className: string,
		/**
		 * any valid React children
		 */
		children: oneOfType([
			node,
			arrayOf(node),
		]),
		/**
		 * style variations of the button
		 */
		kind: oneOf([
			'primary',
			'link',
			'success',
			'warning',
			'danger',
			'info',
		]),
		/**
		 * size variations of the button
		 */
		size: oneOf([
			'short',
			'small',
			'large',
		]),
		/**
		 * Called when the user clicks the `Button`.
		 *
		 * Signature: `({ event, props }) => {}`
		 */
		onClick: func,
		/**
		 * form element type variations of button. Defaults to 'button' to avoid being triggered by 'Enter' anywhere on the page. Passed through to DOM button.
		 */
		type: string,
	},

	getDefaultProps() {
		return {
			isDisabled: false,
			isActive: false,
			onClick: _.noop,
			type: 'button',
		};
	},

	render() {
		return <div></div>;
	},
});

export default Button;
