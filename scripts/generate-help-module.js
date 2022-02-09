'use strict';

const { promises: fs } = require('fs');
const { resolve } = require('path');

async function generateHelpModule() {
	const mdFilename = resolve(__dirname, '../cli/help.md');
	const mdContent = await fs.readFile(mdFilename, 'utf8');

	const tsFilename = resolve(__dirname, '../cli/help.ts');
	const tsContent = `import { version } from '../package.json';

export default \`${mdContent.replace('__VERSION__', '${version}').replace(/`/g, '\\`')}\`;
`;
	await fs.writeFile(tsFilename, tsContent);
}

generateHelpModule();
