import { writeFile } from 'node:fs/promises';
import type { AstNodeName, AstTypeName, AstUnionName } from './ast-types.js';
import { AST_NODES, astNodeNamesWithFieldOrder, NODE_UNION_TYPES } from './ast-types.js';
import { generateNotEditFilesComment, lintTsFile } from './helpers.js';

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

const parentNodesByNodeType: Partial<Record<AstTypeName, Set<AstNodeName>>> = {};
for (const { name, fields } of astNodeNamesWithFieldOrder) {
	for (const field of fields) {
		if ('nodeTypes' in field) {
			for (const fieldTypeName of field.nodeTypes) {
				(parentNodesByNodeType[fieldTypeName] ||= new Set()).add(name);
			}
		}
	}
}

const unionsByNode: Partial<Record<AstTypeName, Set<AstUnionName>>> = {};
for (const [name, members] of Object.entries(astTypesByUnionType)) {
	for (const member of members) {
		if (member !== name) {
			(unionsByNode[member] ||= new Set()).add(name as AstUnionName);
		}
	}
}

const normalizedNodeParentsPerUnionType = new Map<AstUnionName, Set<AstNodeName>>();
for (const unionName of unionTypes) {
	const includedUnions = new Set<AstUnionName>([unionName]);
	for (const includedUnion of includedUnions) {
		for (const containedUnion of unionsByNode[includedUnion] || []) {
			includedUnions.add(containedUnion);
		}
	}
	const parents = new Set<AstNodeName>();
	for (const includedUnion of includedUnions) {
		for (const parent of parentNodesByNodeType[includedUnion] || []) {
			parents.add(parent);
		}
	}
	normalizedNodeParentsPerUnionType.set(unionName, parents);
}

// Remove explicit parents that are already parent of one of the unions a node is part of
for (const [nodeName, unions] of Object.entries(unionsByNode)) {
	const explicitParents = parentNodesByNodeType[nodeName as AstNodeName];
	if (explicitParents) {
		for (const union of unions) {
			const normalizedParents = normalizedNodeParentsPerUnionType.get(union)!;
			for (const parent of explicitParents) {
				if (normalizedParents.has(parent)) {
					explicitParents.delete(parent);
				}
			}
		}
	}
}

const sortedAstTypes = [...nodeTypes].sort();
const sortedUnionTypes = [...unionTypes].filter(unionType => !nodeTypes.has(unionType)).sort();

const nodeUnions = `${notEditFilesComment}
${sortedAstTypes.map(astType => `import ${astType} from './${astType}';`).join('\n')}

${sortedUnionTypes
	.map(unionType => {
		const members = astTypesByUnionType[unionType];
		return `export type ${unionType} = ${members.join(' | ')};`;
	})
	.join('\n\n')}

export type AstNode = ${sortedAstTypes.map(name => `${name}`).join(' | ')};

${sortedUnionTypes.map(renderParentType).join('\n\n')}

${sortedAstTypes.map(renderParentType).join('\n\n')}
`;

function renderParentType(astType: AstTypeName) {
	const parents = [
		...(unionsByNode[astType]
			? [...unionsByNode[astType]].sort().map(union => `${union}Parent`)
			: []),
		...(parentNodesByNodeType[astType] ? [...parentNodesByNodeType[astType]].sort() : [])
	];
	return `export type ${astType}Parent = ${parents.length > 0 ? parents.join(' | ') : 'null'};`;
}

await writeFile(nodeUnionsFile, nodeUnions);
await lintTsFile(nodeUnionsFile);
