// this looks ridiculous, but it prevents sourcemap tooling from mistaking
// this for an actual sourceMappingURL
export let SOURCEMAPPING_URL = 'sourceMa';
SOURCEMAPPING_URL += 'ppingURL';

const whiteSpaceNoNewline =
	'[ \\f\\r\\t\\v\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000\\ufeff]';

export const SOURCEMAPPING_URL_RE = new RegExp(`^#${whiteSpaceNoNewline}+${SOURCEMAPPING_URL}=.+`);
