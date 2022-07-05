import { errFailedValidation, error } from './error';
import { lowercaseBundleKeys, OutputBundleWithPlaceholders } from './outputBundle';
import { extname } from './path';
import { isPathFragment } from './relativeId';

export function renderNamePattern(
	pattern: string,
	patternName: string,
	replacements: { [name: string]: (size?: number) => string }
): string {
	if (isPathFragment(pattern))
		return error(
			errFailedValidation(
				`Invalid pattern "${pattern}" for "${patternName}", patterns can be neither absolute nor relative paths. If you want your files to be stored in a subdirectory, write its name without a leading slash like this: subdirectory/pattern.`
			)
		);
	return pattern.replace(
		/\[(\w+)(:\d+)?]/g,
		(_match, type: string, size: `:${string}` | undefined) => {
			if (!replacements.hasOwnProperty(type) || (size && type !== 'hash')) {
				return error(
					errFailedValidation(
						`"[${type}${size || ''}]" is not a valid placeholder in the "${patternName}" pattern.`
					)
				);
			}
			const replacement = replacements[type](size && parseInt(size.slice(1)));
			if (isPathFragment(replacement))
				return error(
					errFailedValidation(
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
	const ext = extname(name);
	name = name.substring(0, name.length - ext.length);
	let uniqueName: string,
		uniqueIndex = 1;
	while (reservedLowercaseBundleKeys.has((uniqueName = name + ++uniqueIndex + ext).toLowerCase()));
	return uniqueName;
}
