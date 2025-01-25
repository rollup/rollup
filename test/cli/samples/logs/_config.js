const assert = require('node:assert');
const path = require('node:path');

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
			stderr.replaceAll(__dirname + path.sep, 'CWD/'),
			`${CYAN}
${BOLD}main.js${REGULAR} → ${BOLD}stdout${REGULAR}...${NOCOLOR}
${BOLD}${CYAN}[plugin test] simple-info${NOCOLOR}${REGULAR}
${BOLD}${CYAN}[plugin test] complex-info${NOCOLOR}${REGULAR}
${GRAY}https://my-url.net${NOCOLOR}
${BOLD}${BLUE}[plugin test] simple-debug${NOCOLOR}${REGULAR}
${BOLD}${BLUE}[plugin test] complex-debug${NOCOLOR}${REGULAR}
${GRAY}https://my-url.net${NOCOLOR}
${BOLD}${CYAN}[plugin test] main.js (1:12): transform-info${NOCOLOR}${REGULAR}
${GRAY}https://my-url.net${NOCOLOR}
${BOLD}CWD/main.js:1:12${REGULAR}
${GRAY}1: assert.ok( true );
               ^${NOCOLOR}
${BOLD}${BLUE}[plugin test] main.js (1:13): transform-debug${NOCOLOR}${REGULAR}
${GRAY}https://my-url.net${NOCOLOR}
${BOLD}CWD/main.js:1:13${REGULAR}
${GRAY}1: assert.ok( true );
                ^${NOCOLOR}
`
		);
	}
});
