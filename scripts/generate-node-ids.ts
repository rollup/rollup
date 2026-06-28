import { writeFile } from 'node:fs/promises';
import { astNodeNamesWithFieldOrder } from './ast-types.js';
import { generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const nodeIdsFile = new URL('../src/ast/nodeIds.ts', import.meta.url);

// Build a map from astType to all indices that correspond to it
const nodeIdsByAstType: Record<string, number[]> = {};
for (const [index, { name, node }] of astNodeNamesWithFieldOrder.entries()) {
	const astType = node.astType || name;
	const ids = (nodeIdsByAstType[astType] ||= []);
	ids.push(index);
}

const nodeIds = `${notEditFilesComment}export const nodeIds: Record<string, number[]> = {
  ${Object.entries(nodeIdsByAstType)
		.sort(([astType1], [astType2]) => astType1.localeCompare(astType2))
		.map(([astType, ids]) => `${astType}: [${ids.join(', ')}]`)
		.join(',\n  ')}
};
`;

await writeFile(nodeIdsFile, nodeIds);
await lintTsFile(nodeIdsFile);
