import { writeFile } from 'node:fs/promises';
import { AST_NODES, astNodeNamesWithFieldOrder } from './ast-types.js';
import { generateNotEditFilesComment, lintRustFile, toScreamingSnakeCase } from './helpers.js';

const BYTES_PER_U32 = 4;

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const astConstantsFile = new URL(
	'../rust/parse_ast/src/convert_ast/converter/ast_constants.rs',
	import.meta.url
);

const nodeTypes = astNodeNamesWithFieldOrder
	.map(({ name, node: { useMacro } }, index) =>
		useMacro === false
			? `pub const TYPE_${toScreamingSnakeCase(name)}: [u8; 4] = ${index}u32.to_ne_bytes();\n`
			: ''
	)
	.join('');

const reservedBytesAndOffsets = astNodeNamesWithFieldOrder
	.map(({ name, fields, node: { useMacro } }) => {
		const { flags, hasSameFieldsAs } = AST_NODES[name];
		if (hasSameFieldsAs || useMacro !== false) {
			return '';
		}
		/** @type {string[]} */
		const lines = [];
		// reservedBytes is the number of bytes reserved for
		// - end position
		// - flags if present
		// - non-inlined fields
		let reservedBytes = BYTES_PER_U32;
		if (flags) {
			reservedBytes += BYTES_PER_U32;
		}
		for (const [fieldName, fieldType] of fields) {
			lines.push(
				`pub const ${toScreamingSnakeCase(name)}_${toScreamingSnakeCase(
					fieldName
				)}_OFFSET: usize = ${reservedBytes};`
			);
			switch (fieldType) {
				case 'Float': {
					reservedBytes += 8;
					break;
				}
				default: {
					reservedBytes += BYTES_PER_U32;
				}
			}
		}
		lines.unshift(
			`pub const ${toScreamingSnakeCase(name)}_RESERVED_BYTES: usize = ${reservedBytes};`
		);
		return `${lines.join('\n')}\n`;
	})
	.join('\n');

const astConstants = `${notEditFilesComment}
${nodeTypes}

${reservedBytesAndOffsets}
`;

await writeFile(astConstantsFile, astConstants);
await lintRustFile(astConstantsFile);
