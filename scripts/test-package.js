import { readFile } from 'node:fs/promises';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const chokidarPackage = JSON.parse(
	await readFile(new URL('../node_modules/chokidar/package.json', import.meta.url), 'utf8')
);
const chokidarFsevents =
	chokidarPackage.dependencies.fsevents || chokidarPackage.optionalDependencies.fsevents;
const packageFsevents = pkg.optionalDependencies.fsevents;
if (chokidarFsevents !== packageFsevents) {
	throw new Error(
		`The dependency "fsevents" should exist with the same version range "${chokidarFsevents}" as it has for chokidar but it has "${packageFsevents}".`
	);
}
