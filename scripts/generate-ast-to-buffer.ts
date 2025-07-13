#!/usr/bin/env vite-node

import { writeFile } from 'node:fs/promises';
import type { AstNodeName, AstTypeName, FieldDescription, NodeDescription } from './ast-types.js';
import { astNodeNamesWithFieldOrder } from './ast-types.js';
import { generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const astToBufferFile = new URL('../src/utils/astToBuffer.ts', import.meta.url);

interface AstTypeDescription {
	fields: FieldDescription[];
	flags?: string[];
	index: number;
	node: NodeDescription;
	nodeName: AstNodeName;
	typeName: AstTypeName;
}

const astNodesByAstType: Partial<Record<AstTypeName, AstTypeDescription[]>> = {};

astNodeNamesWithFieldOrder.forEach(({ name, node, fields }, index) => {
	const astType = node.astType ?? name;
	(astNodesByAstType[astType] ||= []).push({
		fields,
		flags: node.flags,
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
			return `${astType}: serialize${astType}Node`;
		}
		return `${astType}: (node, buffer) => ${getNodeSerializerBody(nodes[0])}`;
	})
	.join(',\n');

const nonCanonicalSerializers = nonCanonicalAstTypes
	.flatMap(({ nodes }) =>
		nodes.map(node => {
			return `const serialize${node.nodeName}: NodeSerializer<ast.${node.nodeName}> = (node, buffer) => ${getNodeSerializerBody(node)}`;
		})
	)
	.join('\n\n');

function getNodeSerializerBody({ index, fields, flags }: AstTypeDescription): string {
	const fieldSerializers: string[] = [];
	let nextPosition = 3; // 1 for type, 2 for start and end
	if (flags) {
		// TODO
		nextPosition++;
	}
	for (const { name, type } of fields) {
		switch (type) {
			case 'NodeList': {
				fieldSerializers.push(
					`buffer = serializeNodeList(node.${name}, buffer, nodePosition + ${nextPosition});`
				);
				nextPosition += 1; // 1 for the length of the list
				break;
			}
		}
		nextPosition += type === 'Float' ? 2 : 1;
	}
	return `{
		const nodePosition = buffer.position;
		  buffer.position = nodePosition + ${nextPosition};
		  buffer[nodePosition] = ${index};
		  buffer[nodePosition + 1] = node.start;
		  buffer[nodePosition + 2] = node.end;
		  return buffer;
		}`;
}

// language=TypeScript
const astToBuffer = `${notEditFilesComment}
import type { AstNode } from '../rollup/ast-types';
import type { ast } from '../rollup/types';
import type { AstBufferForWriting } from './getAstBuffer';
import { createAstBuffer } from './getAstBuffer';

type NodeSerializer<T extends ast.AstNode> = (
	node: T,
	buffer: AstBufferForWriting
) => AstBufferForWriting;

const INITIAL_BUFFER_SIZE = 2 ** 16; // 64KB

export function serializeProgram(program: ast.Program): Uint32Array {
	const initialBuffer = createAstBuffer(INITIAL_BUFFER_SIZE);
	const buffer = nodeSerializers[program.type](program, initialBuffer);
	return buffer.slice(0, buffer.position);
}

const serializeExpressionStatementNode: NodeSerializer<ast.ExpressionStatement | ast.Directive
> = (node, buffer) => {
	return 'directive' in node ? serializeDirective(node, buffer) : serializeExpressionStatement(node, buffer);
};

const serializeLiteralNode: NodeSerializer<ast.Literal> = (node, buffer) => {
	switch (typeof node.value) {
		case 'object':
			if (node.value === null) {
				return serializeLiteralNull(node, buffer);
			}
			return serializeLiteralRegExp(node as ast.LiteralRegExp, buffer);
		case 'boolean':
			return serializeLiteralBoolean(node as ast.LiteralBoolean, buffer);
		case 'number':
			return serializeLiteralNumber(node as ast.LiteralNumber, buffer);
		case 'string':
			return serializeLiteralString(node as ast.LiteralString, buffer);
		case 'bigint':
			return serializeLiteralBigInt(node as ast.LiteralBigInt, buffer);
		default: {
			/* istanbul ignore next */
			throw new Error(\`Unexpected node value type for Literal: $\{typeof node.value}\`);
		}
	}
};

type NodeSerializers = {
  [key in ast.AstNode['type']]: NodeSerializer<Extract<ast.AstNode, { type: key }>>;
};

const nodeSerializers: NodeSerializers = {
  ${canonicalSerializers}
};

${nonCanonicalSerializers}

function serializeNodeList(
	nodes: readonly AstNode[],
	buffer: AstBufferForWriting,
	referencePosition: number
): AstBufferForWriting {
	const { length } = nodes;
	if (length === 0) {
		buffer[referencePosition] = 0;
		return buffer;
	}
	let insertPosition = buffer.position;
	buffer[referencePosition] = insertPosition;
	buffer[insertPosition] = length;
	insertPosition++;
	buffer.position = insertPosition + length;
	for (let index = 0; index < length; index++) {
		const node = nodes[index];
		if (node === null) {
			buffer[insertPosition + index] = 0;
		} else {
			buffer[insertPosition + index] = buffer.position;
			buffer = nodeSerializers[node.type](node as any, buffer);
		}
	}
	return buffer;
}
`;

await writeFile(astToBufferFile, astToBuffer);

await lintTsFile(astToBufferFile);
