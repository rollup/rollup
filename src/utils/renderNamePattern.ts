import error from './error';
import { extname } from './path';
import { isPlainName } from './relativeId';

export function renderNamePattern(
	pattern: string,
	patternName: string,
	getReplacement: (name: string) => string
) {
	if (!isPlainName(pattern))
		error({
			code: 'INVALID_PATTERN',
			message: `Invalid output pattern "${pattern}" for ${patternName}, cannot be an absolute or relative URL or path.`
		});
	return pattern.replace(/\[(\w+)\]/g, (_match, type) => {
		const replacement = getReplacement(type);
		if (replacement === undefined)
			error({
				code: 'INVALID_PATTERN_REPLACEMENT',
				message: `"${type}" is not a valid substitution name in output option ${patternName} pattern.`
			});
		if (!isPlainName(replacement))
			error({
				code: 'INVALID_PATTERN_REPLACEMENT',
				message: `Invalid replacement "${replacement}" for "${type}" in ${patternName} pattern, must be a plain path name.`
			});
		return replacement;
	});
}

export function makeUnique(name: string, existingNames: Record<string, any>) {
	if (name in existingNames === false) return name;

	const ext = extname(name);
	name = name.substr(0, name.length - ext.length);
	let uniqueName,
		uniqueIndex = 1;
	while (existingNames[(uniqueName = name + ++uniqueIndex + ext)]);
	return uniqueName;
}
