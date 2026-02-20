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
	.map(({ name, node: { useMacro } }, index) => {
		if (useMacro === false) {
			// For bespoke nodes, generate both the u32 ID (for const generics) and byte array (for buffer)
			return `pub const NODE_TYPE_ID_${toScreamingSnakeCase(name)}: u32 = ${index};\npub const TYPE_${toScreamingSnakeCase(name)}: [u8; 4] = NODE_TYPE_ID_${toScreamingSnakeCase(name)}.to_ne_bytes();\n`;
		}
		return '';
	})
	.join('');

const reservedBytesAndOffsets = astNodeNamesWithFieldOrder
	.map(({ name, fields, node: { useMacro } }) => {
		const { flags, hasSameFieldsAs } = AST_NODES[name];
		if (hasSameFieldsAs || useMacro !== false) {
			return '';
		}
		const lines: string[] = [];
		// reservedBytes is the number of bytes reserved for
		// - end position
		// - flags if present
		// - non-inlined fields
		let reservedBytes = BYTES_PER_U32;
		if (flags) {
			reservedBytes += BYTES_PER_U32;
		}
		for (const { name: fieldName, type: fieldType } of fields) {
			lines.push(
				`pub const ${toScreamingSnakeCase(name)}_${toScreamingSnakeCase(
					fieldName
				)}_OFFSET: usize = ${reservedBytes};`
			);
			reservedBytes += fieldType === 'Float' ? 8 : BYTES_PER_U32;
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
