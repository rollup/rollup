import { writeFile } from 'node:fs/promises';
import { generateNotEditFilesComment, lintRustFile, lintTsFile } from './helpers.ts';
import { STRING_CONSTANTS } from './string-constants.ts';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const targetRustFile = new URL(
	'../rust/parse_ast/src/convert_ast/converter/string_constants.rs',
	import.meta.url
);
const targetTsFile = new URL('../src/utils/convert-ast-strings.ts', import.meta.url);
const targetSerializeTsFile = new URL('../src/utils/serialize-ast-strings.ts', import.meta.url);

const rustCode =
	notEditFilesComment +
	STRING_CONSTANTS.map(
		([variableName, value], index) =>
			`pub const ${variableName}: [u8; 4] = ${index}u32.to_ne_bytes(); // ${value}`
	).join('\n');

const tsCode =
	notEditFilesComment +
	`export default ` +
	JSON.stringify(
		STRING_CONSTANTS.map(([, value]) => value),
		undefined,
		2
	) +
	`;\n`;

const serializeTsCode =
	notEditFilesComment +
	`export default {` +
	STRING_CONSTANTS.map(([_, value], index) => `${JSON.stringify(value)}: ${index},`)
		.sort()
		.join('\n') +
	`};\n`;

await Promise.all([
	writeFile(targetTsFile, tsCode).then(() => lintTsFile(targetTsFile)),
	writeFile(targetRustFile, rustCode).then(() => lintRustFile(targetRustFile)),
	writeFile(targetSerializeTsFile, serializeTsCode).then(() => lintTsFile(targetSerializeTsFile))
]);
