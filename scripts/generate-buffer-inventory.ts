import { writeFile } from 'node:fs/promises';
import { BUFFER_FORMAT_VERSION, BUFFER_INVENTORY_FIELDS } from './ast-types.ts';
import { WORD_SIZE } from './buffer-layout.ts';
import {
	generateNotEditFilesComment,
	lintRustFile,
	lintTsFile,
	toScreamingSnakeCase
} from './helpers.ts';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const targetRustFile = new URL(
	'../rust/parse_ast/src/convert_ast/converter/buffer_inventory_constants.rs',
	import.meta.url
);
const targetTsFile = new URL('../src/utils/bufferInventory.ts', import.meta.url);

// Both sides derive their offsets from the same field order defined in
// BUFFER_INVENTORY_FIELDS. Rust uses byte offsets; JS uses u32 indices.
const fields = BUFFER_INVENTORY_FIELDS.map((field, index) => ({
	allowNull: 'allowNull' in field && field.allowNull,
	byteOffsetName: `BUFFER_${toScreamingSnakeCase(field.name)}_BYTE_OFFSET`,
	capitalizedName: field.name[0].toUpperCase() + field.name.slice(1),
	index,
	name: field.name,
	type: field.type,
	wordIndexName: `BUFFER_${toScreamingSnakeCase(field.name)}_WORD_INDEX`
}));

if (fields[0].type !== 'FormatVersion') {
	throw new Error('The format version must be the first buffer inventory field');
}

const rustConstants = `${notEditFilesComment}
pub const BUFFER_INVENTORY_BYTES: usize = ${fields.length * WORD_SIZE};
pub const BUFFER_FORMAT_VERSION: u32 = ${BUFFER_FORMAT_VERSION};
${fields.map(f => `pub const ${f.byteOffsetName}: usize = ${f.index * WORD_SIZE};`).join('\n')}
`;

const tsConstants = `${notEditFilesComment}
export const BUFFER_INVENTORY_WORD_COUNT = ${fields.length};
export const BUFFER_FORMAT_VERSION = ${BUFFER_FORMAT_VERSION};
${fields.map(f => `export const ${f.wordIndexName} = ${f.index};`).join('\n')}
`;

const tsReaders = fields
	.map(({ allowNull, capitalizedName, name, type, wordIndexName }) => {
		if (type === 'FormatVersion') {
			return '';
		}
		if (type === 'Node') {
			if (allowNull) {
				throw new Error('Nullable node references are not supported in the buffer inventory');
			}
			return `export const get${capitalizedName}Position = (buffer: Uint32Array): number => {
	const ${name}Position = buffer[${wordIndexName}];
	if (${name}Position >= buffer.length) {
		throw corruptedBufferError(\`node reference \${${name}Position} is outside the buffer\`);
	}
	return ${name}Position;
};`;
		}
		if (type === 'Section') {
			return `export const get${capitalizedName} = (buffer: Uint32Array): ${
				allowNull ? 'Uint32Array | null' : 'Uint32Array'
			} => get${allowNull ? 'Nullable' : ''}Section(buffer, ${wordIndexName});`;
		}
		throw new Error(`Unhandled inventory field type ${type}`);
	})
	.filter(reader => reader)
	.join('\n\n');

const corruptedBufferErrorHelper = fields.some(({ type }) => type === 'Node' || type === 'Section')
	? `export const corruptedBufferError = (description: string): Error =>
	new Error(\`Corrupted AST buffer: \${description}. Discard the buffer and parse the code again.\`);
`
	: '';

const sectionHelpers = fields.some(({ type }) => type === 'Section')
	? `const getSection = (buffer: Uint32Array, referenceWordIndex: number): Uint32Array => {
	const sectionPosition = buffer[referenceWordIndex];
	if (sectionPosition >= buffer.length) {
		throw corruptedBufferError(\`section reference \${sectionPosition} is outside the buffer\`);
	}
	const sectionEnd = sectionPosition + 1 + buffer[sectionPosition];
	if (sectionEnd > buffer.length) {
		throw corruptedBufferError(\`section at word \${sectionPosition} exceeds the buffer\`);
	}
	return buffer.subarray(sectionPosition + 1, sectionEnd);
};
${
	fields.some(({ allowNull, type }) => type === 'Section' && allowNull)
		? `
const getNullableSection = (
	buffer: Uint32Array,
	referenceWordIndex: number
): Uint32Array | null =>
	buffer[referenceWordIndex] === 0 ? null : getSection(buffer, referenceWordIndex);
`
		: ''
}`
	: '';

const tsFile = `${tsConstants}
${corruptedBufferErrorHelper}
${sectionHelpers}
${tsReaders}
`;

await Promise.all([
	writeFile(targetRustFile, rustConstants).then(() => lintRustFile(targetRustFile)),
	writeFile(targetTsFile, tsFile).then(() => lintTsFile(targetTsFile))
]);
