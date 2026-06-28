import { writeFile } from 'node:fs/promises';
import { SCOPE_NODE_FIELDS } from './ast-types.js';
import {
	generateNotEditFilesComment,
	lintRustFile,
	lintTsFile,
	toScreamingSnakeCase
} from './helpers.js';

const BYTES_PER_U32 = 4;

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const targetRustFile = new URL(
	'../rust/parse_ast/src/convert_ast/converter/scope_constants.rs',
	import.meta.url
);
const targetTsFile = new URL('../src/utils/scopeConstants.ts', import.meta.url);

// Both sides derive their offsets from the same field order defined in
// SCOPE_NODE_FIELDS. Rust uses byte offsets; JS uses u32 indices.
const fields = SCOPE_NODE_FIELDS.map((field, index) => ({
	constantName: `SCOPE_${toScreamingSnakeCase(field.name)}_OFFSET`,
	index
}));

const rustConstants = `${notEditFilesComment}
${fields.map(f => `pub const ${f.constantName}: usize = ${f.index * BYTES_PER_U32};`).join('\n')}
`;

const tsConstants = `${notEditFilesComment}
${fields.map(f => `export const ${f.constantName} = ${f.index};`).join('\n')}
`;

await Promise.all([
	writeFile(targetRustFile, rustConstants).then(() => lintRustFile(targetRustFile)),
	writeFile(targetTsFile, tsConstants).then(() => lintTsFile(targetTsFile))
]);
