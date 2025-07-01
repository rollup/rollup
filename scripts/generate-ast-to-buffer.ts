#!/usr/bin/env vite-node

import { writeFile } from 'node:fs/promises';
import type { AstNodeName, AstTypeName, NodeDescription } from './ast-types.js';
import { astNodeNamesWithFieldOrder } from './ast-types.js';
import { generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const astToBufferFile = new URL('../src/utils/astToBuffer.ts', import.meta.url);
const nonCanonicalNodesToBufferFile = new URL(
	'../src/utils/nonCanonicalNodesToBuffer.ts',
	import.meta.url
);

interface AstTypeDescription {
	index: number;
	nodeName: AstNodeName;
	node: NodeDescription;
	typeName: AstTypeName;
}

const astNodesByAstType: Partial<Record<AstTypeName, AstTypeDescription[]>> = {};

astNodeNamesWithFieldOrder.forEach(({ name, node }, index) => {
	const astType = node.astType ?? name;
	(astNodesByAstType[astType] ||= []).push({
		index,
		node,
		nodeName: name,
		typeName: astType
	});
});

const nonCanonicalAstTypes: { astType: AstTypeName; nodes: AstTypeDescription[] }[] = [];

const canonicalSerializers = Object.entries(astNodesByAstType)
	.sort(([astTypeA], [astTypeB]) => astTypeA.localeCompare(astTypeB))
	.map(([astType, nodes]) => {
		if (nodes.length !== 1) {
			nonCanonicalAstTypes.push({ astType: astType as AstTypeName, nodes });
			return `${astType}: serialize${astType}`;
		}
		const { index } = nodes[0];
		return `${astType}: (node, buffer, position) => {
	  buffer[position] = ${index};
	  buffer[position + 1] = node.start;
	  buffer[position + 2] = node.end;
	  return [buffer, position + 3];
	}`;
	})
	.join(',\n');

const nonCanonicalSerializers = nonCanonicalAstTypes
	.flatMap(({ nodes }) =>
		nodes.map(node => {
			return `export const serialize${node.nodeName}: NodeSerializer<ast.${node.nodeName}> = (node, buffer, position) => {
		  buffer[position] = ${node.index};
		  buffer[position + 1] = node.start;
		  buffer[position + 2] = node.end;
		  return [buffer, position + 3];
		}`;
		})
	)
	.join('\n\n');

const astToBuffer = `${notEditFilesComment}
import type { ast } from '../rollup/types';
import type { NodeSerializer } from './nonCanonicalNodesToBuffer';
import { ${nonCanonicalAstTypes.map(({ astType }) => `serialize${astType}`)} } from './polymorphicNodesToBuffer';

const INITIAL_BUFFER_SIZE = 2 ** 16; // 64KB

export function serializeProgram(program: ast.Program): Uint32Array {
  const initialBuffer = new Uint32Array(INITIAL_BUFFER_SIZE);
  const [buffer, position] = nodeSerializers[program.type](program, initialBuffer, 0);
  return buffer.slice(0, position);
}

type NodeSerializers = {
  [key in ast.AstNode['type']]: NodeSerializer<Extract<ast.AstNode, { type: key }>>;
};

const nodeSerializers: NodeSerializers = {
  ${canonicalSerializers}
};
`;

await writeFile(astToBufferFile, astToBuffer);

const nonCanonicalNodesToBuffer = `${notEditFilesComment}
import type { ast } from '../rollup/types';

export type NodeSerializer<T extends ast.AstNode> = (
  node: T,
  buffer: Uint32Array,
  position: number
) => [buffer: Uint32Array, position: number];

${nonCanonicalSerializers}
`;

await writeFile(nonCanonicalNodesToBufferFile, nonCanonicalNodesToBuffer);

await lintTsFile(astToBufferFile);
await lintTsFile(nonCanonicalNodesToBufferFile);
