import { isPlainName } from './relativeId';
import error from './error';

export default function renderName(
	pattern: string,
	patternName: string,
	getReplacement: (name: string) => string
) {
	if (!isPlainName(pattern))
		error({
			code: 'INVALID_PATTERN',
			message: `Invalid output pattern "${pattern}" for ${patternName}, cannot be an absolute or relative path.`
		});
	return pattern.replace(/\[(\w+)\]/g, type => {
		const replacement = getReplacement(type);
		if (!isPlainName(replacement))
			error({
				code: 'INVALID_PATTERN_REPLACEMENT',
				message: `Invalid replacement for "${type}" in ${patternName} pattern, cannot be an absolute or relative path.`
			});
		return replacement || type;
	});
}
