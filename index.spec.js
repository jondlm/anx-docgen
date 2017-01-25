const anxDocgen = require('./index');

describe('anxDocgen', () => {
	describe('#fromPaths', () => {
		it('should correctly parse 01 set of fixtures', () => {
			return anxDocgen.fromPaths([
				'./test/fixtures/01/Banner.jsx',
				'./test/fixtures/01/Button.jsx',
				'./test/fixtures/01/Accordion.jsx',
			]).then((docgenMap) => {
				return expect(docgenMap).toMatchSnapshot();
			});
		});
	});
});
