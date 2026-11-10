import { writeFile } from 'node:fs/promises';
import type { AstNodeName, AstTypeName, AstUnionName } from './ast-types.ts';
import { AST_NODES, NODE_UNION_TYPES } from './ast-types.ts';
import { generateNotEditFilesComment, lintTsFile } from './helpers.ts';
import {
	getParentTypeInfo,
	renderParentMap,
	renderParentOf,
	ROOT_NODE_NAMES
} from './parent-types.ts';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const nodeUnionsFile = new URL('../src/ast/nodes/node-unions.ts', import.meta.url);

const unionTypes = new Set(Object.keys(NODE_UNION_TYPES)) as Set<AstUnionName>;

const nodeTypes = new Set<AstTypeName>(
	Object.entries(AST_NODES).map(
		([name, nodeDescription]) => nodeDescription.astType || (name as AstNodeName)
	)
);

const astTypesByUnionType = Object.fromEntries(
	Object.entries(NODE_UNION_TYPES).map(([unionType, members]) => [
		unionType,
		[
			...new Set(
				members.map(member => {
					if (unionTypes.has(member as AstUnionName)) {
						return member;
					}
					const nodeDescription = AST_NODES[member as AstNodeName];
					if (!nodeDescription) {
						throw new Error(`Unknown node: ${member}`);
					}
					return nodeDescription.astType || member;
				})
			)
		]
	])
) as Record<AstUnionName, AstTypeName[]>;

const sortedAstTypes = [...nodeTypes].sort();
const sortedUnionTypes = [...unionTypes].filter(unionType => !nodeTypes.has(unionType)).sort();

const parentTypeInfo = getParentTypeInfo();
const parentMap = renderParentMap(parentTypeInfo, schemaName => {
	const astType = parentTypeInfo.astTypeBySchemaName.get(schemaName);
	if (!astType) {
		throw new Error(`Unknown node: ${schemaName}`);
	}
	return astType;
});
const parentOf = renderParentOf();

function renderParentType(typeName: string) {
	return `export type ${typeName}Parent = ${ROOT_NODE_NAMES.has(typeName) ? 'null' : `ParentOf<${typeName}>`};`;
}

const nodeUnions = `${notEditFilesComment}
${sortedAstTypes.map(astType => `import ${astType} from './${astType}';`).join('\n')}

${sortedUnionTypes
	.map(unionType => {
		const members = astTypesByUnionType[unionType];
		return `export type ${unionType} = ${members.join(' | ')};`;
	})
	.join('\n\n')}

export type AstNode = ${sortedAstTypes.map(name => `${name}`).join(' | ')};

${parentMap}

${parentOf}

${sortedAstTypes.map(renderParentType).join('\n\n')}
`;

await writeFile(nodeUnionsFile, nodeUnions);
await lintTsFile(nodeUnionsFile);
