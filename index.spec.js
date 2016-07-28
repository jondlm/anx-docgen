const anxDocgen = require('./index');
const assert = require('assert');
const fs = require('fs');

describe('anxDocgen', () => {
	describe('#fromPaths', () => {
		it('should correctly parse 01 set of fixtures', (done) => {
			var expectedDocgenMap = JSON.parse(fs.readFileSync('./test/fixtures/01/docgenMap.json', 'utf8'));

			anxDocgen.fromPaths([
				'./test/fixtures/01/Banner.jsx',
				'./test/fixtures/01/Button.jsx',
			]).then((docgenMap) => {
				assert.deepEqual(docgenMap, expectedDocgenMap);
				done();
			}).catch(done);
		});
	});
});
