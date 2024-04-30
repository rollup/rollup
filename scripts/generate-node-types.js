import { writeFile } from 'node:fs/promises';
import { AST_NODES } from './ast-types.js';
import { generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const nodeTypesFile = new URL('../src/ast/nodes/NodeType.ts', import.meta.url);

/** @type string[] */
const astTypes = [
	...new Set(Object.entries(AST_NODES).map(([name, node]) => node.astType || name))
].sort();

const nodeIndex = `${notEditFilesComment}
${astTypes.map(astType => `export type t${astType} = '${astType}';`).join('\n')}

${astTypes.map(astType => `export const ${astType}: t${astType} = '${astType}';`).join('\n')}
`;

await writeFile(nodeTypesFile, nodeIndex);
await lintTsFile(nodeTypesFile);
