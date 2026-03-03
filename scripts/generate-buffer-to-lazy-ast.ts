import { writeFile } from 'node:fs/promises';
import type { FieldDescription, NodeDescription } from './ast-types.js';
import { astNodeNamesWithFieldOrder } from './ast-types.js';
import { firstLettersLowercase, generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const bufferToJsAstFile = new URL('../src/utils/bufferToLazyAst.ts', import.meta.url);

const jsConverters = astNodeNamesWithFieldOrder.map(({ name, fields, node }) => {
	const definitions: string[] = [];
	let offset = 2;
	if (node.flags) {
		offset++;
		definitions.push('const flags = buffer[position + 2];\n');
		for (const [index, flag] of node.flags.entries()) {
			if (isHoistedField(flag, node)) {
				definitions.push(`const ${flag} = (flags & ${1 << index}) === ${1 << index};`);
			}
		}
	}
	for (const [index, field] of fields.entries()) {
		definitions.push(getFieldDefinition(field, index + offset));
		if (isHoistedField(field.name, node)) {
			definitions.push(
				`const ${field.name} = ${getFieldPropertyBase(field, name, node, index + offset)};`
			);
		}
	}
	const properties: string[] = [
		...(node.flags || []).map((name, index) =>
			isHoistedField(name, node) ? name : `${name}: (flags & ${1 << index}) === ${1 << index}`
		),
		...fields
			.map((field, index) => getFieldProperty(field, name, node, index + offset))
			.filter(Boolean),
		...getFixedProperties(node),
		...Object.entries(node.additionalFields || []).map(([key, { value }]) => `${key}: ${value}`)
	];
	return `function ${node.converterFunction || firstLettersLowercase(name)} (position, buffer): ast.${name} {
    ${definitions.join('')}const node: ast.${name} =  {
      type: '${node.astType || name}',
      start: buffer[position],
      end: buffer[position + 1],
      ${properties.join(',\n')}
    };
    return node;
  }`;
});

function isHoistedField(name: string, node: NodeDescription): boolean | undefined {
	return (
		node.baseForAdditionalFields?.includes(name) ||
		(node.optionalFallback && Object.values(node.optionalFallback).includes(name))
	);
}

function getFieldDefinition(field: FieldDescription, offset: number): string {
	const position = `position + ${offset}`;
	const dataStart = `buffer[${position}]`;
	switch (field.type) {
		case 'NodeList':
		case 'FixedString':
		case 'Float': {
			return '';
		}
		case 'Node': {
			return field.allowNull ? `const ${field.name}Position = ${dataStart};\n` : '';
		}
		case 'Annotations': {
			return `const ${field.name} = convertAnnotations(${dataStart}, buffer);\n`;
		}
		case 'String': {
			return field.optional ? `const ${field.name}Position = ${dataStart};\n` : '';
		}
		default: {
			throw new Error(`Unhandled field type ${(field as { type: string }).type}`);
		}
	}
}

function getFieldProperty(
	field: FieldDescription,
	nodeName: string,
	node: NodeDescription,
	offset: number
): string {
	if (node.serializeHiddenFields?.[field.name]) {
		return '';
	}
	if (isHoistedField(field.name, node)) {
		return field.name;
	}
	switch (field.type) {
		case 'Annotations': {
			return `...(${field.name}.length > 0 ? { ${field.name} } : {})`;
		}
		default: {
			return `get ${field.name}() {
			  const result = ${getFieldPropertyBase(field, nodeName, node, offset)};
			  Object.defineProperty(node, '${field.name}', { value: result });
			  return result;
			}`;
		}
	}
}

function getFieldPropertyBase(
	field: FieldDescription,
	nodeName: string,
	node: NodeDescription,
	offset: number
): string {
	const position = `position + ${offset}`;
	const dataStart = `buffer[${position}]`;
	switch (field.type) {
		case 'Node': {
			if (field.allowNull) {
				const fallback = node.optionalFallback?.[field.name];
				return `${field.name}Position === 0 ? ${fallback ? `{ ...${fallback} }` : null} : convertNode(${field.name}Position, buffer)`;
			}
			return `convertNode(${dataStart}, buffer)`;
		}
		case 'NodeList': {
			return `convertNodeList(${dataStart}, buffer)`;
		}
		case 'String': {
			return field.optional
				? `${field.name}Position === 0 ? undefined : buffer.convertString(${field.name}Position)`
				: `buffer.convertString(${dataStart})`;
		}
		case 'FixedString': {
			return `FIXED_STRINGS[${dataStart}] as ast.${nodeName}['${field.name}']`;
		}
		case 'Float': {
			return `new DataView(buffer.buffer).getFloat64(${position} << 2, true)`;
		}
		default: {
			throw new Error(`Unhandled field type ${(field as { type: string }).type}`);
		}
	}
}

function getFixedProperties(node: NodeDescription): string[] {
	return Object.entries(node.fixed || {}).map(([key, value]) => `${key}: ${value}`);
}

const bufferToJsAst = `${notEditFilesComment}
import { PanicError, ParseError } from '../ast/nodes/NodeType';import type { RollupAstNode } from '../rollup/types';
import type { ast, DeserializeAst } from '../rollup/types';
import type { RollupAnnotation } from './astConverterHelpers';
import { convertAnnotations } from './astConverterHelpers';
import { EMPTY_ARRAY } from './blank';
import FIXED_STRINGS from './convert-ast-strings';
import type { AstBuffer } from './getAstBuffer';
import { getAstBuffer } from './getAstBuffer';
import { error, getRollupError, logParseError } from './logs';

export const deserializeLazyAst: DeserializeAst = (buffer, position = 0) => {
  const node = convertNode(position, getAstBuffer(buffer));
  switch (node.type) {
    case PanicError: {
      return error(getRollupError(logParseError(node.message)));
    }
    case ParseError: {
      return error(getRollupError(logParseError(node.message, node.start)));
    }
    default: {
      return node;
    }
  }
};

/* eslint-disable sort-keys */
const nodeConverters: ((position: number, buffer: AstBuffer) => any)[] = [
  ${jsConverters.join(',\n')}
];

export function convertNode(position: number, buffer: AstBuffer): any {
  const nodeType = buffer[position];
  const converter = nodeConverters[nodeType];
  /* istanbul ignore if: This should never be executed but is a safeguard against faulty buffers */
  if (!converter) {
    console.trace();
    throw new Error(\`Unknown node type: \${nodeType}\`);
  }
  return converter(position + 1, buffer);
}

function convertNodeList(position: number, buffer: AstBuffer): readonly any[] {
  if (position === 0) return EMPTY_ARRAY;
  const length = buffer[position++];
  const list: any[] = new Array(length);
  for (let index = 0; index < length; index++) {
    const nodePosition = buffer[position++];
    list[index] = nodePosition ? convertNode(nodePosition, buffer) : null;
  }
  return list;
}
`;

await writeFile(bufferToJsAstFile, bufferToJsAst);
await lintTsFile(bufferToJsAstFile);
