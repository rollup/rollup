const path = require('node:path');
const assert = require('node:assert');
const fs = require('node:fs');

module.exports = defineTest({
	description:
		'supports loading TypeScript config files referencing workspace projects via plugin option',
	spawnArgs: [
		'--config',
		'rollup.config.ts',
		'--configPlugin',
		"typescript={tsconfig:'../tsconfig.json',include:'**/*.ts',exclude:'**/node_modules/**/*.ts'}"
	],
	execute: false,
	show: true,
	result: code => {
		assert(
			code ===
				fs.readFileSync(
					path.join(__dirname, 'packages', 'bundle', 'src', 'bundlable-code.js'),
					'utf8'
				)
		);
	},
	cwd: path.join(__dirname, 'packages', 'bundle')
});
