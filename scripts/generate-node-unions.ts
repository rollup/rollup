import { writeFile } from 'node:fs/promises';
import type { AstTypeName, AstUnionName } from './ast-types.ts';
import { astNodeNamesWithFieldOrder, getAstTypeName, NODE_UNION_TYPES } from './ast-types.ts';
import { generateNotEditFilesComment, lintTsFile } from './helpers.ts';
import {
	getParentTypeInfo,
	renderNodesWithUnionFieldAliases,
	renderParentMap,
	renderParentOf,
	ROOT_NODE_NAMES
} from './parent-types.ts';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const nodeUnionsFile = new URL('../src/ast/nodes/node-unions.ts', import.meta.url);

const unionTypes = new Set(Object.keys(NODE_UNION_TYPES)) as Set<AstUnionName>;

const nodeTypes = new Set<AstTypeName>(
	astNodeNamesWithFieldOrder.map(({ name }) => getAstTypeName(name))
);

const astTypesByUnionType = Object.fromEntries(
	Object.entries(NODE_UNION_TYPES).map(([unionType, members]) => [
		unionType,
		[...new Set(members.map(getAstTypeName))]
	])
) as Record<AstUnionName, AstTypeName[]>;

const sortedAstTypes = [...nodeTypes].sort();
const sortedUnionTypes = [...unionTypes].filter(unionType => !nodeTypes.has(unionType)).sort();

const parentTypeInfo = getParentTypeInfo();
const mapParentName = (schemaName: string) => getAstTypeName(schemaName as AstTypeName);
const nodesWithUnionFieldAliases = renderNodesWithUnionFieldAliases(parentTypeInfo, mapParentName);
const parentMap = renderParentMap(parentTypeInfo, mapParentName);
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

${nodesWithUnionFieldAliases}

${parentMap}

${parentOf}

${sortedAstTypes.map(renderParentType).join('\n\n')}
`;

await writeFile(nodeUnionsFile, nodeUnions);
await lintTsFile(nodeUnionsFile);
