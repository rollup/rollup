const pkg = require('../package.json');

function checkChokidar() {
	const chokidarPkg = require('../node_modules/chokidar/package.json');
	const chokidarFsevents =
		chokidarPkg.dependencies.fsevents || chokidarPkg.optionalDependencies.fsevents;
	if (!chokidarFsevents) return;
	const pkgFsevents = pkg.optionalDependencies.fsevents;
	if (chokidarFsevents !== pkgFsevents) {
		throw new Error(
			`The dependency "fsevents" should exist with the same version range "${chokidarFsevents}" as it has for chokidar but it has "${pkgFsevents}".`
		);
	}
}

checkChokidar();
