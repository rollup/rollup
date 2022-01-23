import { dirname } from './path';

// ported from https://github.com/substack/node-commondir
export default function commondir(files: readonly string[]): string {
	if (files.length === 0) return '/';
	if (files.length === 1) return dirname(files[0]);
	const commonSegments = files.slice(1).reduce((commonSegments, file) => {
		const pathSegements = file.split(/\/+|\\+/);
		let i;
		for (
			i = 0;
			commonSegments[i] === pathSegements[i] &&
			i < Math.min(commonSegments.length, pathSegements.length);
			i++
		);
		return commonSegments.slice(0, i);
	}, files[0].split(/\/+|\\+/));

	// Windows correctly handles paths with forward-slashes
	return commonSegments.length > 1 ? commonSegments.join('/') : '/';
}
