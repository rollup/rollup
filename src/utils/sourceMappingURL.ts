// this looks ridiculous, but it prevents sourcemap tooling from mistaking
// this for an actual sourceMappingURL
let SOURCEMAPPING_URL = 'sourceMa';
SOURCEMAPPING_URL += 'ppingURL';
const whiteSpaceNoNewline = '[ \\f\\r\\t\\v\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000\\ufeff]';

const SOURCEMAPPING_URL_LINE_COMMENT_RE = `//#${whiteSpaceNoNewline}+${SOURCEMAPPING_URL}=.+`;
const SOURCEMAPPING_URL_BLOCK_COMMENT_RE = `/\\*#${whiteSpaceNoNewline}+${SOURCEMAPPING_URL}=.+\\*/`;
const SOURCEMAPPING_URL_COMMENT_RE = new RegExp(
  `(${SOURCEMAPPING_URL_LINE_COMMENT_RE})|(${SOURCEMAPPING_URL_BLOCK_COMMENT_RE})`, 'g');

export { SOURCEMAPPING_URL, SOURCEMAPPING_URL_COMMENT_RE};
