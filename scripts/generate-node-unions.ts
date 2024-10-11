import { writeFile } from 'node:fs/promises';
import type { AstNodeName } from './ast-types.js';
import { AST_NODES, NODE_UNION_TYPES } from './ast-types.js';
import { generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const nodeUnionsFile = new URL('../src/ast/nodes/node-unions.ts', import.meta.url);

const unionTypes = new Set(Object.keys(NODE_UNION_TYPES));
const astTypes = new Set<string>();
const astTypesByUnionType = Object.fromEntries(
	Object.entries(NODE_UNION_TYPES).map(([unionType, members]) => [
		unionType,
		[
			...new Set(
				members.map(member => {
					if (unionTypes.has(member)) {
						return member;
					}
					const nodeDescription = AST_NODES[member as AstNodeName];
					if (!nodeDescription) {
						throw new Error(`Unknown node: ${member}`);
					}
					const astType = nodeDescription.astType || member;
					astTypes.add(astType);
					return astType;
				})
			)
		]
	])
);

const nodeUnions = `${notEditFilesComment}
${[...astTypes]
	.sort()
	.map(astType => `import ${astType} from './${astType}';`)
	.join('\n')}

${[...unionTypes]
	.filter(unionType => !astTypes.has(unionType))
	.sort()
	.map(unionType => {
		const members = astTypesByUnionType[unionType];
		return `export type ${unionType} = ${members.join(' | ')};`;
	})
	.join('\n\n')}
`;

await writeFile(nodeUnionsFile, nodeUnions);
await lintTsFile(nodeUnionsFile);
