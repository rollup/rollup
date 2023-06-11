const assert = require('node:assert');

const BOLD = '\u001B[1m';
const BLUE = '\u001B[34m';
const CYAN = '\u001B[36m';
const GRAY = '\u001B[90m';
const NOCOLOR = '\u001B[39m';
const REGULAR = '\u001B[22m';

module.exports = defineTest({
	description: 'displays logs',
	skipIfWindows: true,
	command: 'rollup --config',
	env: { FORCE_COLOR: '1', TERM: 'xterm' },
	stderr(stderr) {
		assert.strictEqual(
			stderr,
			`${CYAN}
${BOLD}main.js${REGULAR} → ${BOLD}stdout${REGULAR}...${NOCOLOR}
${BOLD}${CYAN}simple-info${NOCOLOR}${REGULAR}
${BOLD}${CYAN}complex-info${NOCOLOR}${REGULAR}
${GRAY}https://rollupjs.org/https://my-url.net${NOCOLOR}
${BOLD}${BLUE}simple-debug${NOCOLOR}${REGULAR}
${BOLD}${BLUE}complex-debug${NOCOLOR}${REGULAR}
${GRAY}https://rollupjs.org/https://my-url.net${NOCOLOR}
${BOLD}${CYAN}transform-info${NOCOLOR}${REGULAR}
${GRAY}https://rollupjs.org/https://my-url.net${NOCOLOR}
${BOLD}main.js (1:12)${REGULAR}
${GRAY}1: assert.ok( true );
               ^${NOCOLOR}
${BOLD}${BLUE}transform-debug${NOCOLOR}${REGULAR}
${GRAY}https://rollupjs.org/https://my-url.net${NOCOLOR}
${BOLD}main.js (1:13)${REGULAR}
${GRAY}1: assert.ok( true );
                ^${NOCOLOR}
`
		);
	}
});
