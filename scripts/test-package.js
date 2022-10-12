import { readFile } from 'node:fs/promises';

const package_ = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const chokidarPackage = JSON.parse(
	await readFile(new URL('../node_modules/chokidar/package.json', import.meta.url), 'utf8')
);
const chokidarFsevents =
	chokidarPackage.dependencies.fsevents || chokidarPackage.optionalDependencies.fsevents;
const packageFsevents = package_.optionalDependencies.fsevents;
if (chokidarFsevents !== packageFsevents) {
	throw new Error(
		`The dependency "fsevents" should exist with the same version range "${chokidarFsevents}" as it has for chokidar but it has "${packageFsevents}".`
	);
}
