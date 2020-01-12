const pkg = require('../package.json');

function checkTypes() {
	for (const key of Object.keys(pkg.dependencies)) {
		if (key.startsWith('@types') && pkg.dependencies[key] !== '*') {
			throw new Error(
				`The dependency ${key} should have version range "*" but it has "${pkg.dependencies[key]}".`
			);
		}
	}
}

function checkChokidar() {
	const chokidarPkg = require('../node_modules/chokidar/package.json');
	const chokidarFsevents = chokidarPkg.dependencies.fsevents;
	if (!chokidarFsevents) return;
	const pkgFsevents = pkg.optionalDependencies.fsevents;
	if (chokidarFsevents !== pkgFsevents) {
		throw new Error(
			`The dependency "fsevents" should exist with the same version range "${chokidarFsevents}" as it has for chokidar but it has "${pkgFsevents}".`
		);
	}
}

checkTypes();
checkChokidar();
