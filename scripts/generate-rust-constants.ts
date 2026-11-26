import { writeFile } from 'node:fs/promises';
import { AST_NODES, astNodeNamesWithFieldOrder } from './ast-types.ts';
import {
	ENCODED_PARENT_BIAS,
	NODE_DATA_BYTES_AFTER_END,
	NODE_DATA_OFFSET,
	NODE_END_OFFSET,
	NODE_PARENT_OFFSET,
	NODE_START_OFFSET,
	NODE_TYPE_OFFSET,
	WORD_SIZE
} from './buffer-layout.ts';
import { generateNotEditFilesComment, lintRustFile, toScreamingSnakeCase } from './helpers.ts';

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
		let reservedBytes = NODE_DATA_BYTES_AFTER_END;
		if (flags) {
			reservedBytes += WORD_SIZE;
		}
		for (const { name: fieldName, type: fieldType } of fields) {
			lines.push(
				`pub const ${toScreamingSnakeCase(name)}_${toScreamingSnakeCase(
					fieldName
				)}_OFFSET: usize = ${reservedBytes};`
			);
			if (
				fieldType !== 'ScopeOffset' &&
				fieldType !== 'Float' &&
				fieldType !== 'Node' &&
				fieldType !== 'NodeList' &&
				fieldType !== 'String' &&
				fieldType !== 'FixedString' &&
				fieldType !== 'Annotations'
			) {
				throw new Error(`Unhandled field type ${fieldType}`);
			}
			reservedBytes += fieldType === 'Float' ? 2 * WORD_SIZE : WORD_SIZE;
		}
		lines.unshift(
			`pub const ${toScreamingSnakeCase(name)}_RESERVED_BYTES: usize = ${reservedBytes};`
		);
		return `${lines.join('\n')}\n`;
	})
	.join('\n');

const bufferLayout = `pub const WORD_SIZE: usize = ${WORD_SIZE};
pub const NODE_TYPE_OFFSET: usize = ${NODE_TYPE_OFFSET};
pub const NODE_PARENT_OFFSET: usize = ${NODE_PARENT_OFFSET};
pub const NODE_START_OFFSET: usize = ${NODE_START_OFFSET};
pub const NODE_END_OFFSET: usize = ${NODE_END_OFFSET};
pub const NODE_DATA_OFFSET: usize = ${NODE_DATA_OFFSET};
pub const NODE_DATA_BYTES_AFTER_END: usize = ${NODE_DATA_BYTES_AFTER_END};
pub const ENCODED_PARENT_BIAS: usize = ${ENCODED_PARENT_BIAS};`;

const astConstants = `${notEditFilesComment}
${bufferLayout}
${nodeTypes}

${reservedBytesAndOffsets}
`;

await writeFile(astConstantsFile, astConstants);
await lintRustFile(astConstantsFile);
