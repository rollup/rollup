import { writeFile } from 'node:fs/promises';
import { generateNotEditFilesComment, lintRustFile, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const targetRustFile = new URL(
	'../rust/parse_ast/src/convert_ast/converter/string_constants.rs',
	import.meta.url
);
const targetTsFile = new URL('../src/utils/convert-ast-strings.ts', import.meta.url);

const stringConstantsTemplate = [
	['STRING_VAR', 'var'],
	['STRING_LET', 'let'],
	['STRING_CONST', 'const'],
	['STRING_INIT', 'init'],
	['STRING_GET', 'get'],
	['STRING_SET', 'set'],
	['STRING_CONSTRUCTOR', 'constructor'],
	['STRING_METHOD', 'method'],
	['STRING_MINUS', '-'],
	['STRING_PLUS', '+'],
	['STRING_BANG', '!'],
	['STRING_TILDE', '~'],
	['STRING_TYPEOF', 'typeof'],
	['STRING_VOID', 'void'],
	['STRING_DELETE', 'delete'],
	['STRING_PLUSPLUS', '++'],
	['STRING_MINUSMINUS', '--'],
	['STRING_EQEQ', '=='],
	['STRING_NOTEQ', '!='],
	['STRING_EQEQEQ', '==='],
	['STRING_NOTEQEQ', '!=='],
	['STRING_LT', '<'],
	['STRING_LTEQ', '<='],
	['STRING_GT', '>'],
	['STRING_GTEQ', '>='],
	['STRING_LSHIFT', '<<'],
	['STRING_RSHIFT', '>>'],
	['STRING_ZEROFILLRSHIFT', '>>>'],
	['STRING_ADD', '+'],
	['STRING_SUB', '-'],
	['STRING_MUL', '*'],
	['STRING_DIV', '/'],
	['STRING_MOD', '%'],
	['STRING_BITOR', '|'],
	['STRING_BITXOR', '^'],
	['STRING_BITAND', '&'],
	['STRING_LOGICALOR', '||'],
	['STRING_LOGICALAND', '&&'],
	['STRING_IN', 'in'],
	['STRING_INSTANCEOF', 'instanceof'],
	['STRING_EXP', '**'],
	['STRING_NULLISHCOALESCING', '??'],
	['STRING_ASSIGN', '='],
	['STRING_ADDASSIGN', '+='],
	['STRING_SUBASSIGN', '-='],
	['STRING_MULASSIGN', '*='],
	['STRING_DIVASSIGN', '/='],
	['STRING_MODASSIGN', '%='],
	['STRING_LSHIFTASSIGN', '<<='],
	['STRING_RSHIFTASSIGN', '>>='],
	['STRING_ZEROFILLRSHIFTASSIGN', '>>>='],
	['STRING_BITORASSIGN', '|='],
	['STRING_BITXORASSIGN', '^='],
	['STRING_BITANDASSIGN', '&='],
	['STRING_EXPASSIGN', '**='],
	['STRING_ANDASSIGN', '&&='],
	['STRING_ORASSIGN', '||='],
	['STRING_NULLISHASSIGN', '??='],
	['STRING_PURE', 'pure'],
	['STRING_NOSIDEEFFECTS', 'noSideEffects'],
	['STRING_SOURCEMAP', 'sourcemap'],
	['STRING_USING', 'using'],
	['STRING_AWAIT_USING', 'await using']
];

const rustCode =
	notEditFilesComment +
	stringConstantsTemplate
		.map(
			([variableName, value], index) =>
				`pub const ${variableName}: [u8; 4] = ${index}u32.to_ne_bytes(); // ${value}`
		)
		.join('\n');

const tsCode =
	notEditFilesComment +
	`export default ` +
	JSON.stringify(
		stringConstantsTemplate.map(([, value]) => value),
		undefined,
		2
	) +
	`;\n`;

await Promise.all([
	writeFile(targetTsFile, tsCode).then(() => lintTsFile(targetTsFile)),
	writeFile(targetRustFile, rustCode).then(() => lintRustFile(targetRustFile))
]);
