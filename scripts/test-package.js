const pkg = require('../package.json');

for (const key of Object.keys(pkg.dependencies)) {
	if (key.startsWith('@types') && pkg.dependencies[key] !== '*') {
		throw new Error(
			`The dependency ${key} should have version range "*" but it has "${pkg.dependencies[key]}".`
		);
	}
}

const chokidarPkg = require('../node_modules/chokidar/package.json');
if (chokidarPkg.dependencies.fsevents !== pkg.dependencies.fsevents) {
	throw new Error(
		`The dependency "fsevents" should exist with the same version range "${chokidarPkg.dependencies.fsevents}" as it has for chokidar but it has "${pkg.dependencies.fsevents}".`
	);
}
