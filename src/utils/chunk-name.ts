import * as path from './path';

export function generateChunkName(
	id: string,
	existingNames: { [name: string]: boolean },
	startAtTwo = false,
	inputRelativeDir = ''
): string {
	let name;
	if (inputRelativeDir) {
		name = path.relative(inputRelativeDir, id).replace(/\\/g, '/');
	} else {
		name = path.basename(id);
	}
	let ext = path.extname(name);
	name = name.substr(0, name.length - ext.length);
	if (ext !== '.js' && ext !== '.mjs') {
		name += ext;
		ext = '.js';
	}
	let uniqueName = name;
	let uniqueIndex = startAtTwo ? 2 : 1;
	while (existingNames[uniqueName]) uniqueName = name + uniqueIndex++;
	existingNames[uniqueName] = true;
	return uniqueName + ext;
}
