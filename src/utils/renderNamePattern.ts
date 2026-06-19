import { error, logFailedValidation } from './logs';
import type { OutputBundleWithPlaceholders } from './outputBundle';
import { lowercaseBundleKeys } from './outputBundle';
import { isPathFragment } from './relativeId';

export function renderNamePattern(
	pattern: string,
	patternName: string,
	replacements: Record<string, (size?: number) => string>
): string {
	if (isPathFragment(pattern))
		return error(
			logFailedValidation(
				`Invalid pattern "${pattern}" for "${patternName}", patterns can be neither absolute nor relative paths. If you want your files to be stored in a subdirectory, write its name without a leading slash like this: subdirectory/pattern.`
			)
		);
	return pattern.replace(
		/\[(\w+)(:\d+)?]/g,
		(_match, type: string, size: `:${string}` | undefined) => {
			if (!replacements.hasOwnProperty(type) || (size && type !== 'hash')) {
				return error(
					logFailedValidation(
						`"[${type}${size || ''}]" is not a valid placeholder in the "${patternName}" pattern.`
					)
				);
			}
			const replacement = replacements[type](size && Number.parseInt(size.slice(1)));
			if (isPathFragment(replacement))
				return error(
					logFailedValidation(
						`Invalid substitution "${replacement}" for placeholder "[${type}]" in "${patternName}" pattern, can be neither absolute nor relative path.`
					)
				);
			return replacement;
		}
	);
}

export function makeUnique(
	name: string,
	{ [lowercaseBundleKeys]: reservedLowercaseBundleKeys }: OutputBundleWithPlaceholders
): string {
	if (!reservedLowercaseBundleKeys.has(name.toLowerCase())) return name;
	const slashIndex = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
	// This will also handle -1 correctly
	const directory = name.slice(0, slashIndex + 1);
	const fileName = name.slice(slashIndex + 1);
	const dotIndex = fileName.indexOf('.', 1);
	const base = directory + (dotIndex === -1 ? fileName : fileName.slice(0, dotIndex));
	const extension = dotIndex === -1 ? '' : fileName.slice(dotIndex);
	let uniqueName: string,
		uniqueIndex = 1;
	while (
		reservedLowercaseBundleKeys.has((uniqueName = base + ++uniqueIndex + extension).toLowerCase())
	);
	return uniqueName;
}
