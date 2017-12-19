// this looks ridiculous, but it prevents sourcemap tooling from mistaking
// this for an actual sourceMappingURL
let SOURCEMAPPING_URL = 'sourceMa';
SOURCEMAPPING_URL += 'ppingURL';

const SOURCEMAPPING_URL_RE = new RegExp(`^#\\s+${SOURCEMAPPING_URL}=.+\\n?`);

export { SOURCEMAPPING_URL, SOURCEMAPPING_URL_RE };
