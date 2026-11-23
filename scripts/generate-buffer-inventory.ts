import { writeFile } from 'node:fs/promises';
import { BUFFER_INVENTORY_FIELDS } from './ast-types.ts';
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
	capitalizedName: field.name[0].toUpperCase() + field.name.slice(1),
	constantName: `BUFFER_${toScreamingSnakeCase(field.name)}_OFFSET`,
	index,
	type: field.type
}));

const rustConstants = `${notEditFilesComment}
pub const BUFFER_INVENTORY_BYTES: usize = ${fields.length * WORD_SIZE};
${fields.map(f => `pub const ${f.constantName}: usize = ${f.index * WORD_SIZE};`).join('\n')}
`;

const tsConstants = `${notEditFilesComment}
export const BUFFER_INVENTORY_WORD_COUNT = ${fields.length};
${fields.map(f => `export const ${f.constantName} = ${f.index};`).join('\n')}
`;

const tsReaders = fields
	.map(({ allowNull, capitalizedName, constantName, type }) => {
		if (type === 'Node') {
			if (allowNull) {
				throw new Error('Nullable node references are not supported in the buffer inventory');
			}
			return `export const get${capitalizedName}Position = (buffer: Uint32Array): number =>
	buffer[${constantName}];`;
		}
		if (type === 'Section') {
			return `export const get${capitalizedName} = (buffer: Uint32Array): ${
				allowNull ? 'Uint32Array | null' : 'Uint32Array'
			} => get${allowNull ? 'Nullable' : ''}Section(buffer, ${constantName});`;
		}
		throw new Error(`Unhandled inventory field type ${type}`);
	})
	.join('\n\n');

const sectionHelpers = fields.some(({ type }) => type === 'Section')
	? `const getSection = (buffer: Uint32Array, referenceOffset: number): Uint32Array => {
	const position = buffer[referenceOffset];
	return buffer.subarray(position + 1, position + 1 + buffer[position]);
};
${
	fields.some(({ allowNull, type }) => type === 'Section' && allowNull)
		? `
const getNullableSection = (
	buffer: Uint32Array,
	referenceOffset: number
): Uint32Array | null =>
	buffer[referenceOffset] === 0 ? null : getSection(buffer, referenceOffset);
`
		: ''
}`
	: '';

const tsFile = `${tsConstants}
${sectionHelpers}
${tsReaders}
`;

await Promise.all([
	writeFile(targetRustFile, rustConstants).then(() => lintRustFile(targetRustFile)),
	writeFile(targetTsFile, tsFile).then(() => lintTsFile(targetTsFile))
]);
