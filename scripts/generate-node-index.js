import { writeFile } from 'node:fs/promises';
import { AST_NODES } from './ast-types.js';
import { generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const nodeIndexFile = new URL('../src/ast/nodes/index.ts', import.meta.url);

/** @type string[] */
const astTypes = [
	...new Set(Object.entries(AST_NODES).map(([name, node]) => node.astType || name)),
	'UnknownNode'
].sort();

const nodeIndex = `${notEditFilesComment}
${astTypes.map(astType => `import ${astType} from './${astType}';`).join('\n')}
import type { NodeBase } from './shared/Node';

export const nodeConstructors: {
	[name: string]: typeof NodeBase;
} = {
	${astTypes.join(',\n\t')}
};
`;

await writeFile(nodeIndexFile, nodeIndex);
await lintTsFile(nodeIndexFile);
