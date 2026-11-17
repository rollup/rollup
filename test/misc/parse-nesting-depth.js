const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const rollupDirectory = path.resolve(__dirname, '../..');

const childScript = `
const path = require('node:path');
const [mode, shape, depthArgument, rollupDirectory] = process.argv.slice(1);
const depth = Number(depthArgument);
const sources = {
	chain: () => Array.from({ length: depth }, () => 'a').join(' || '),
	jsxMember: () => '<' + 'a.'.repeat(depth) + 'b/>',
	parentheses: () => '('.repeat(depth) + '0' + ')'.repeat(depth)
};
const source = sources[shape]();
const parseOptions = shape === 'jsxMember' ? { jsx: true } : {};
const { parseAst, parseAstAsync } = require(path.join(rollupDirectory, 'dist/parseAst.js'));
const { rollup } = require(path.join(rollupDirectory, 'dist/rollup.js'));

async function run() {
	try {
		if (mode === 'parseAst') {
			parseAst(source, parseOptions);
		} else if (mode === 'parseAstAsync') {
			await parseAstAsync(source, parseOptions);
		} else {
			const bundle = await rollup({
				input: 'main',
				plugins: [{ load: id => (id === 'main' ? source : null), name: 'test', resolveId: id => id }]
			});
			await bundle.close();
		}
		console.log(JSON.stringify({ result: 'parsed' }));
	} catch (error) {
		const recovered = (() => {
			try {
				parseAst('export const a = 1;');
				return true;
			} catch {
				return false;
			}
		})();
		console.log(
			JSON.stringify({ code: error.code, message: error.message, pos: error.pos, recovered, result: 'caught' })
		);
	}
}

run();
`;

function runInChildProcess(mode, shape, depth) {
	const { status, signal, stdout, stderr } = spawnSync(
		process.execPath,
		['-e', childScript, mode, shape, String(depth), rollupDirectory],
		{ encoding: 'utf8' }
	);
	assert.strictEqual(
		signal,
		null,
		`the native parser must not crash the process, but it terminated with ${signal}:\n${stderr}`
	);
	assert.strictEqual(status, 0, `the child process failed with exit code ${status}:\n${stderr}`);
	return JSON.parse(stdout.trim().split('\n').pop());
}

function assertNestingError(result) {
	assert.strictEqual(result.result, 'caught');
	assert.strictEqual(result.code, 'PARSE_ERROR');
	assert.match(result.message, /nest(?:ed|ing)/);
	assert.strictEqual(
		result.recovered,
		true,
		'the parser must stay usable after rejecting an input'
	);
}

describe('deeply nested expressions', () => {
	it('can still parse nesting below the depth limit', () => {
		assert.deepStrictEqual(runInChildProcess('parseAst', 'parentheses', 100), { result: 'parsed' });
		assert.deepStrictEqual(runInChildProcess('parseAst', 'chain', 100), { result: 'parsed' });
		assert.deepStrictEqual(runInChildProcess('parseAst', 'jsxMember', 100), { result: 'parsed' });
	});

	for (const mode of ['parseAst', 'parseAstAsync', 'rollup']) {
		it(`fails with a catchable error when "${mode}" receives too deeply nested expressions`, () => {
			const result = runInChildProcess(mode, 'parentheses', 5000);
			assertNestingError(result);
			assert.ok(
				result.pos > 0 && result.pos < 9900,
				`expected the reported position to point into the nesting, got ${result.pos}`
			);
		});
	}

	it('fails with a catchable error for deeply nested operator chains', () => {
		const result = runInChildProcess('parseAst', 'chain', 3000);
		assertNestingError(result);
		assert.strictEqual(result.pos, 0);
	});

	it('fails with a catchable error for deeply nested JSX member expressions', () => {
		assertNestingError(runInChildProcess('parseAst', 'jsxMember', 3000));
	});
});
