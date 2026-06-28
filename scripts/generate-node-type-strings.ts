import { writeFile } from 'node:fs/promises';
import { astNodeNamesWithFieldOrder } from './ast-types.js';
import { generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const nodeTypeStringsFile = new URL('../src/ast/nodeTypeStrings.ts', import.meta.url);

const nodeTypes = astNodeNamesWithFieldOrder.map(({ name, node }) => node.astType || name);
const nodeTypeStrings = nodeTypes.map(name => `\t'${name}'`);

const content = `${notEditFilesComment}

export const nodeTypeStrings = [
${nodeTypeStrings.join(',\n')}
] as const;
`;

await writeFile(nodeTypeStringsFile, content);
await lintTsFile(nodeTypeStringsFile);
