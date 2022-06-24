import { errFailedValidation, error } from './error';
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
				`Invalid pattern "${pattern}" for "${patternName}", patterns can be neither absolute nor relative paths.`
			)
		);
	return pattern.replace(
		/\[(\w+)(:\d+)?]/g,
		(_match, type: string, size: `:${string}` | undefined) => {
			if (!replacements.hasOwnProperty(type) || (size && type !== 'hash')) {
				// TODO Lukas test size at wrong placeholder, wrong size
				return error(
					errFailedValidation(
						`"[${type}${size || ''}]" is not a valid placeholder in "${patternName}" pattern.`
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

export function makeUnique(name: string, existingNames: Record<string, unknown>): string {
	const existingNamesLowercase = new Set(Object.keys(existingNames).map(key => key.toLowerCase()));
	if (!existingNamesLowercase.has(name.toLocaleLowerCase())) return name;

	const ext = extname(name);
	name = name.substring(0, name.length - ext.length);
	let uniqueName: string,
		uniqueIndex = 1;
	while (existingNamesLowercase.has((uniqueName = name + ++uniqueIndex + ext).toLowerCase()));
	return uniqueName;
}
