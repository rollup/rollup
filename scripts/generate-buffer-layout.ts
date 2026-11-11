import { writeFile } from 'node:fs/promises';
import { astNodeNamesWithFieldOrder } from './ast-types.ts';
import { getFirstFieldWordOffset } from './buffer-layout.ts';
import { generateNotEditFilesComment, lintTsFile } from './helpers.ts';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const bufferLayoutFile = new URL('../src/ast/bufferLayout.ts', import.meta.url);

const identifier = astNodeNamesWithFieldOrder.find(({ name }) => name === 'Identifier');
if (!identifier) {
	throw new Error('Cannot find the Identifier node description');
}
const identifierNameFieldIndex = identifier.fields.findIndex(
	field => field.name === 'name' && field.type === 'String'
);
if (identifierNameFieldIndex < 0) {
	throw new Error('The Identifier node must have a String field named "name"');
}
const identifierNameOffset =
	getFirstFieldWordOffset(Boolean(identifier.node.flags)) + identifierNameFieldIndex;

for (const { name, fields } of astNodeNamesWithFieldOrder) {
	const floatIndex = fields.findIndex(field => field.type === 'Float');
	if (floatIndex >= 0 && floatIndex !== fields.length - 1) {
		// Floats occupy two words, but decoders derive later field offsets from the field index.
		throw new Error(`The Float field ${name}.${fields[floatIndex].name} must be the last field`);
	}
}

const bufferLayout = `${notEditFilesComment}
export const IDENTIFIER_NAME_OFFSET = ${identifierNameOffset};
`;

await writeFile(bufferLayoutFile, bufferLayout);
await lintTsFile(bufferLayoutFile);
