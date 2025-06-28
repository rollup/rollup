import { writeFile } from 'node:fs/promises';
import { AST_NODES } from './ast-types.js';
import { generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const childNodeKeysFile = new URL('../src/ast/childNodeKeys.ts', import.meta.url);

const childNodeKeysByAstType: Record<string, Set<string>> = {};
for (const [name, node] of Object.entries(AST_NODES)) {
	const astType = node.astType || name;
	const keySet = (childNodeKeysByAstType[astType] ||= new Set());
	for (const { name: fieldName, type: fieldType } of (node.hasSameFieldsAs
		? AST_NODES[node.hasSameFieldsAs].fields
		: node.fields) || []) {
		if (['NodeList', 'Node'].includes(fieldType)) {
			keySet.add(fieldName);
		}
	}
}

const childNodeKeys = `${notEditFilesComment}
export const childNodeKeys: Record<string, string[]> = {
  ${Object.entries(childNodeKeysByAstType)
		.sort(([astType1], [astType2]) => astType1.localeCompare(astType2))
		.map(([astType, keys]) => `${astType}: [${[...keys].map(key => `'${key}'`).join(', ')}]`)
		.join(',\n  ')}
};
`;

await writeFile(childNodeKeysFile, childNodeKeys);
await lintTsFile(childNodeKeysFile);
