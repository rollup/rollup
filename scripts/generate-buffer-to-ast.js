import { writeFile } from 'node:fs/promises';
import { astNodeNamesWithFieldOrder } from './ast-types.js';
import { firstLettersLowercase, generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const bufferToJsAstFile = new URL('../src/utils/bufferToAst.ts', import.meta.url);

const jsConverters = astNodeNamesWithFieldOrder.map(({ name, fields, node, originalNode }) => {
	/** @type {string[]} */
	const definitions = [];
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
		definitions.push(getFieldDefinition(field, node, originalNode, index + offset));
		if (isHoistedField(field[0], node)) {
			definitions.push(
				`const ${field[0]} = ${getFieldPropertyBase(field, node, originalNode, index + offset)};`
			);
		}
	}
	/** @type {string[]} */
	const properties = [
		...(node.flags || []).map((name, index) =>
			isHoistedField(name, node) ? name : `${name}: (flags & ${1 << index}) === ${1 << index}`
		),
		...fields
			.map((field, index) => getFieldProperty(field, node, originalNode, index + offset))
			.filter(Boolean),
		...getFixedProperties(node),
		...Object.entries(node.additionalFields || []).map(([key, value]) => `${key}: ${value}`)
	];
	return `function ${firstLettersLowercase(name)} (position, buffer): ${name}Node {
    ${definitions.join('')}return {
      type: '${node.astType || name}',
      start: buffer[position],
      end: buffer[position + 1],
      ${properties.join(',\n')}
    };
  }`;
});

/**
 * @param {string} name
 * @param {import("./ast-types.js").NodeDescription} node
 * @returns {boolean|undefined}
 */
function isHoistedField(name, node) {
	return (
		node.baseForAdditionalFields?.includes(name) ||
		(node.optionalFallback && Object.values(node.optionalFallback).includes(name))
	);
}

/**
 * @param {import("./ast-types.js").FieldWithType} field
 * @param {import("./ast-types.js").NodeDescription} node
 * @param {import("./ast-types.js").NodeDescription} originalNode
 * @param {number} offset
 * @returns {string}
 */
function getFieldDefinition([fieldName, fieldType], node, originalNode, offset) {
	const typeCast = originalNode.fieldTypes?.[fieldName] || node.fieldTypes?.[fieldName];
	const typeCastString = typeCast ? ` as ${typeCast}` : '';
	const position = `position + ${offset}`;
	const dataStart = `buffer[${position}]`;
	switch (fieldType) {
		case 'Node':
		case 'NodeList':
		case 'String':
		case 'FixedString':
		case 'Float': {
			return '';
		}
		case 'OptionalNode': {
			return `const ${fieldName}Position = ${dataStart};\n`;
		}
		case 'Annotations':
		case 'InvalidAnnotations': {
			return `const ${fieldName} = convertAnnotations(${dataStart}, buffer)${typeCastString};\n`;
		}
		case 'OptionalString': {
			return `const ${fieldName}Position = ${dataStart};\n`;
		}
		default: {
			throw new Error(`Unknown field type: ${fieldType}`);
		}
	}
}

/**
 * @param {import("./ast-types.js").FieldWithType} field
 * @param {import("./ast-types.js").NodeDescription} node
 * @param {import("./ast-types.js").NodeDescription} originalNode
 * @param {number} offset
 * @returns {string}
 */
function getFieldProperty([fieldName, fieldType], node, originalNode, offset) {
	if (node.hiddenFields?.includes(fieldName)) {
		return '';
	}
	if (isHoistedField(fieldName, node)) {
		return fieldName;
	}
	switch (fieldType) {
		case 'Annotations': {
			return `...(${fieldName}.length > 0 ? { [ANNOTATION_KEY]: ${fieldName} } : {})`;
		}
		case 'InvalidAnnotations': {
			return `...(${fieldName}.length > 0 ? { [INVALID_ANNOTATION_KEY]: ${fieldName} } : {})`;
		}
		default: {
			return `${fieldName}: ${getFieldPropertyBase([fieldName, fieldType], node, originalNode, offset)}`;
		}
	}
}

/**
 * @param {import("./ast-types.js").FieldWithType} field
 * @param {import("./ast-types.js").NodeDescription} node
 * @param {import("./ast-types.js").NodeDescription} originalNode
 * @param {number} offset
 * @returns {string}
 */
function getFieldPropertyBase([fieldName, fieldType], node, originalNode, offset) {
	const typeCast = originalNode.fieldTypes?.[fieldName] || node.fieldTypes?.[fieldName];
	const typeCastString = typeCast ? ` as ${typeCast}` : '';
	const position = `position + ${offset}`;
	const dataStart = `buffer[${position}]`;
	switch (fieldType) {
		case 'Node': {
			return `convertNode(${dataStart}, buffer)${typeCastString}`;
		}
		case 'OptionalNode': {
			const fallback = node.optionalFallback?.[fieldName];
			return `${fieldName}Position === 0 ? ${fallback ? `{ ...${fallback} }` : null} : convertNode(${fieldName}Position, buffer)${typeCastString}`;
		}
		case 'NodeList': {
			return `convertNodeList(${dataStart}, buffer)${typeCastString}`;
		}
		case 'String': {
			return `buffer.convertString(${dataStart})${typeCastString}`;
		}
		case 'OptionalString': {
			return `${fieldName}Position === 0 ? undefined : buffer.convertString(${fieldName}Position)${typeCastString}`;
		}
		case 'FixedString': {
			return `FIXED_STRINGS[${dataStart}]${typeCastString}`;
		}
		case 'Float': {
			return `new DataView(buffer.buffer).getFloat64(${position} << 2, true)`;
		}
		default: {
			throw new Error(`Cannot get field property base for: ${fieldType}`);
		}
	}
}

/**
 * @param {import("./ast-types.js").NodeDescription} node
 * @return {string[]}
 */
function getFixedProperties(node) {
	return Object.entries(node.fixed || {}).map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
}

const types = astNodeNamesWithFieldOrder.map(({ name, node }) => {
	let typeDefinition = `export type ${name}Node = RollupAstNode<${node.estreeType || `estree.${name}`}>`;
	/** @type {string[]} */
	const additionalFieldTypes = [];
	if ((node.fields || []).some(([, fieldType]) => fieldType === 'Annotations')) {
		additionalFieldTypes.push('[ANNOTATION_KEY]?: readonly RollupAnnotation[]');
	}
	if ((node.fields || []).some(([, fieldType]) => fieldType === 'InvalidAnnotations')) {
		additionalFieldTypes.push('[INVALID_ANNOTATION_KEY]?: readonly RollupAnnotation[]');
	}
	const fixedProperties = getFixedProperties(node);
	if (fixedProperties.length > 0) {
		additionalFieldTypes.push(...getFixedProperties(node));
	}
	if (additionalFieldTypes.length > 0) {
		typeDefinition += ` & { ${additionalFieldTypes.join('; ')} }`;
	}
	typeDefinition += ';';
	return typeDefinition;
});

const bufferToJsAst = `${notEditFilesComment}
import type * as estree from 'estree';
import { PanicError, ParseError } from '../ast/nodes/NodeType';import type { RollupAstNode } from '../rollup/types';
import type { RollupAnnotation } from './astConverterHelpers';
import { ANNOTATION_KEY, convertAnnotations, INVALID_ANNOTATION_KEY } from './astConverterHelpers';
import { EMPTY_ARRAY } from './blank';
import FIXED_STRINGS from './convert-ast-strings';
import type { AstBuffer } from './getAstBuffer';
import { error, getRollupError, logParseError } from './logs';

export function convertProgram(buffer: AstBuffer): ProgramNode {
  const node = convertNode(0, buffer);
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
}

/* eslint-disable sort-keys */
const nodeConverters: ((position: number, buffer: AstBuffer) => any)[] = [
  ${jsConverters.join(',\n')}
];

${types.join('\n')}

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

function convertNodeList(position: number, buffer: AstBuffer): any[] {
  if (position === 0) return EMPTY_ARRAY as never[];
  const length = buffer[position++];
  const list: any[] = [];
  for (let index = 0; index < length; index++) {
    const nodePosition = buffer[position++];
    list.push(nodePosition ? convertNode(nodePosition, buffer) : null);
  }
  return list;
}
`;

await writeFile(bufferToJsAstFile, bufferToJsAst);
await lintTsFile(bufferToJsAstFile);
