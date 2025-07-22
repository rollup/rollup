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

function getNodeSerializerBody({
	index,
	fields,
	flags,
	node: { optionalFallback, serializeHiddenFields }
}: AstTypeDescription): string {
	const fieldSerializers: string[] = [];
	let nextPosition = 3; // 1 for type, 2 for start and end
	if (flags) {
		const flagConverters = flags.map((flag, index) => `((node.${flag} as any) << ${index})`);
		fieldSerializers.push(
			`buffer[nodePosition + ${nextPosition}] = ${flagConverters.join(' | ')};`
		);
		nextPosition++;
	}
	for (const field of fields) {
		const fieldName = serializeHiddenFields?.[field.name] ?? field.name;
		switch (field.type) {
			case 'Node': {
				let fieldSerializer = `buffer = serializeNode(node.${fieldName}, buffer, nodePosition + ${nextPosition});`;
				if (field.allowNull) {
					if (optionalFallback?.[fieldName]) {
						fieldSerializer = `if (node.${fieldName}.end != node.${optionalFallback?.[fieldName]}.end) ${fieldSerializer}`;
					} else {
						fieldSerializer = `if (node.${fieldName} != null) ${fieldSerializer}`;
					}
				}
				fieldSerializers.push(fieldSerializer);
				break;
			}
			case 'NodeList': {
				fieldSerializers.push(
					`buffer = serializeNodeList(node.${fieldName}, buffer, nodePosition + ${nextPosition});`
				);
				break;
			}
			case 'String': {
				let fieldSerializer = `buffer = buffer.addStringToBuffer(node.${fieldName}, nodePosition + ${nextPosition});`;
				if (field.optional) {
					fieldSerializer = `if (node.${fieldName} != null) { ${fieldSerializer} }`;
				}
				fieldSerializers.push(fieldSerializer);
				break;
			}
			case 'Float': {
				fieldSerializers.push(
					`new DataView(buffer.buffer).setFloat64((nodePosition + ${nextPosition}) << 2, node.${fieldName}, true);`
				);
				nextPosition += 1; // Float64 takes 8 bytes
				break;
			}
			case 'FixedString': {
				fieldSerializers.push(
					`buffer[nodePosition + ${nextPosition}] = FIXED_STRING_INDICES[node.${fieldName}];`
				);
				break;
			}
			case 'Annotations': {
				fieldSerializers.push(
					`buffer = serializeAnnotations(node.${fieldName}, buffer, nodePosition + ${nextPosition});`
				);
				break;
			}
			default: {
				throw new Error(`Unhandled field type ${(field as { type: string }).type}`);
			}
		}
		nextPosition += 1;
	}
	return `{
		  const nodePosition = buffer.position;
		  buffer = buffer.reserve(${nextPosition});
		  buffer[nodePosition] = ${index};
		  buffer[nodePosition + 1] = node.start;
		  buffer[nodePosition + 2] = node.end;
		  ${fieldSerializers.map(s => s + '\n').join('')}return buffer;
		}`;
}

const astToBuffer = `${notEditFilesComment}
import type { AstNode } from '../rollup/ast-types';
import type { ast } from '../rollup/types';
import type { AstBufferForWriting } from './getAstBuffer';
import { createAstBufferNode, createAstBufferUint8 } from './getAstBuffer';
import FIXED_STRING_INDICES from './serialize-ast-strings.js';

type NodeSerializer<T extends ast.AstNode> = (
	node: T,
	buffer: AstBufferForWriting
) => AstBufferForWriting;

const INITIAL_BUFFER_SIZE = 2 ** 16; // 64KB

export function serializeAst(node: ast.AstNode): Uint8Array | Buffer {
  const initialBuffer = (
    typeof Buffer === 'undefined' ? createAstBufferUint8 : createAstBufferNode
  )(INITIAL_BUFFER_SIZE);
  const buffer = nodeSerializers[node.type](node as any, initialBuffer);
  return buffer.toOutput();
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

function serializeNode(node: AstNode, buffer: AstBufferForWriting, referencePosition: number
): AstBufferForWriting {
	buffer[referencePosition] = buffer.position;
	return nodeSerializers[node.type](node as any, buffer);
}

function serializeNodeList(nodes: readonly (AstNode | null)[], buffer: AstBufferForWriting, referencePosition: number
): AstBufferForWriting {
	const { length } = nodes;
	if (length === 0) {
		return buffer;
	}
	let insertPosition = buffer.position;
	buffer = buffer.reserve(length + 1);
	buffer[referencePosition] = insertPosition;
	buffer[insertPosition] = length;
	insertPosition++;
	for (let index = 0; index < length; index++) {
		const node = nodes[index];
		if (node != null) {
			buffer[insertPosition + index] = buffer.position;
			buffer = nodeSerializers[node.type](node as any, buffer);
		}
	}
	return buffer;
}

function serializeAnnotations(
  annotations: readonly ast.Annotation[] | undefined,
  buffer: AstBufferForWriting,
  referencePosition: number
): AstBufferForWriting {
  if (annotations == null) {
    return buffer;
  }
  const { length } = annotations;
  if (length === 0) {
    return buffer;
  }
  let insertPosition = buffer.position;
  buffer = buffer.reserve(length + 1);
  buffer[referencePosition] = insertPosition;
  buffer[insertPosition] = length;
  insertPosition++;
  for (let index = 0; index < length; index++) {
    const annotation = annotations[index];
    const annotationPosition = buffer.position;
    buffer = buffer.reserve(3); // 3 for start, end, type
    buffer[insertPosition + index] = annotationPosition;
    buffer[annotationPosition] = annotation.start;
    buffer[annotationPosition + 1] = annotation.end;
    buffer[annotationPosition + 2] = FIXED_STRING_INDICES[annotation.type];
  }
  return buffer;
}
`;

await writeFile(astToBufferFile, astToBuffer);

await lintTsFile(astToBufferFile);
