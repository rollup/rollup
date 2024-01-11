import { dirname } from './path';

// ported from https://github.com/substack/node-commondir
export default function commondir(files: readonly string[]): string {
	if (files.length === 0) return '/';
	if (files.length === 1) return dirname(files[0]);
	const commonSegments = files.slice(1).reduce(
		(commonSegments, file) => {
			const pathSegments = file.split(/\/+|\\+/);
			let index;
			for (
				index = 0;
				commonSegments[index] === pathSegments[index] &&
				index < Math.min(commonSegments.length, pathSegments.length);
				index++
			);
			return commonSegments.slice(0, index);
		},
		files[0].split(/\/+|\\+/)
	);

	// Windows correctly handles paths with forward-slashes
	return commonSegments.length > 1 ? commonSegments.join('/') : '/';
}
