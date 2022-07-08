import { readFile } from 'fs/promises';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const chokidarPkg = JSON.parse(
	await readFile(new URL('../node_modules/chokidar/package.json', import.meta.url), 'utf8')
);
const chokidarFsevents =
	chokidarPkg.dependencies.fsevents || chokidarPkg.optionalDependencies.fsevents;
const pkgFsevents = pkg.optionalDependencies.fsevents;
if (chokidarFsevents !== pkgFsevents) {
	throw new Error(
		`The dependency "fsevents" should exist with the same version range "${chokidarFsevents}" as it has for chokidar but it has "${pkgFsevents}".`
	);
}
