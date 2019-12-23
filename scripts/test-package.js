const pkg = require('../package.json');

for (const key of Object.keys((pkg.dependencies))) {
	if (key.startsWith('@types') && pkg.dependencies[key] !== '*') {
		throw new Error(`The dependency ${key} should have version range "*" but it was "${pkg.dependencies[key]}".`);
	}
}
