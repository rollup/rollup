#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';
import { AST_NODES, astNodeNamesWithFieldOrder } from './ast-types.js';
import { firstLetterLowercase, lintFile } from './helpers.js';

const bufferToJsAstFile = new URL('../src/utils/buffer-to-ast.ts', import.meta.url);

const jsConverters = [
	`function parseError (position, buffer, readString): never {
    const pos = buffer[position++];
    const message = convertString(position, buffer, readString);
    error(logParseError(message, pos));
	}`,
	...astNodeNamesWithFieldOrder.map(({ name, inlinedVariableField, reservedFields, allFields }) => {
		const node = AST_NODES[name];
		const readStringArgument = allFields.some(([, fieldType]) =>
			['Node', 'OptionalNode', 'NodeList', 'String', 'FixedString', 'OptionalString'].includes(
				fieldType
			)
		)
			? ', readString'
			: '';
		/** @type {string[]} */
		const definitions = [];
		if (node.flags) {
			definitions.push(
				'const flags = buffer[position++];\n',
				...node.flags.map(
					(name, index) => `const ${name} = (flags & ${1 << index}) === ${1 << index};`
				)
			);
		}
		for (const [index, field] of reservedFields.entries()) {
			definitions.push(
				`${getFieldDefinition(field, node, false, index === allFields.length - 1)}\n`
			);
		}
		if (inlinedVariableField) {
			definitions.push(`${getFieldDefinition(inlinedVariableField, node, true, true)}\n`);
		}
		/** @type {string[]} */
		const properties = [
			...(node.flags || []),
			...allFields.map(getFieldProperty),
			...getFixedProperties(node),
			...Object.entries(node.additionalFields || []).map(([key, value]) => `${key}: ${value}`)
		];
		return `function ${firstLetterLowercase(
			name
		)} (position, buffer${readStringArgument}): ${name}Node {
    const start = buffer[position++];
    const end = buffer[position++];
    ${definitions.join('')}return {
      type: '${node.astType || name}',
      start,
      end,
      ${properties.join(',\n')}
    };
  }`;
	})
];

/**
 * @param {import('./ast-types.js').FieldWithType} field
 * @param {import('./ast-types.js').NodeDescription} node
 * @param {boolean} isInlined
 * @param {boolean} isLastField
 * @returns {string}
 */
function getFieldDefinition([fieldName, fieldType], node, isInlined, isLastField) {
	const typeCast = node.fieldTypes?.[fieldName];
	const typeCastString = typeCast ? ` as ${typeCast}` : '';
	const getAndUpdatePosition = isLastField ? 'position' : 'position++';
	const dataStart = isInlined ? getAndUpdatePosition : `buffer[${getAndUpdatePosition}]`;
	const variableName = sanitizeVariableName(fieldName);
	switch (fieldType) {
		case 'Node': {
			return `const ${variableName} = convertNode(${dataStart}, buffer, readString)${typeCastString};`;
		}
		case 'OptionalNode': {
			return `const ${fieldName}Position = buffer[${getAndUpdatePosition}];\nconst ${variableName} = ${fieldName}Position === 0 ? null : convertNode(${fieldName}Position, buffer, readString)${typeCastString};`;
		}
		case 'NodeList': {
			return `const ${variableName} = convertNodeList(${dataStart}, buffer, readString)${typeCastString};`;
		}
		case 'Annotations':
		case 'InvalidAnnotations': {
			return `const ${variableName} = convertAnnotations(${dataStart}, buffer)${typeCastString};`;
		}
		case 'String': {
			return `const ${variableName} = convertString(${dataStart}, buffer, readString)${typeCastString};`;
		}
		case 'OptionalString': {
			return `const ${fieldName}Position = buffer[${getAndUpdatePosition}];\nconst ${variableName} = ${fieldName}Position === 0 ? undefined : convertString(${fieldName}Position, buffer, readString)${typeCastString};`;
		}
		case 'FixedString': {
			return `const ${variableName} = FIXED_STRINGS[buffer[${getAndUpdatePosition}]]${typeCastString};`;
		}
		case 'Float': {
			return `const ${variableName} = new DataView(buffer.buffer).getFloat64(${getAndUpdatePosition} << 2, true);`;
		}
		default: {
			throw new Error(`Unknown field type: ${fieldType}`);
		}
	}
}

/**
 * @param {import('./ast-types.js').FieldWithType} field
 * @returns {string}
 */
function getFieldProperty([fieldName, fieldType]) {
	switch (fieldType) {
		case 'Annotations': {
			return `...(${fieldName}.length > 0 ? { [ANNOTATION_KEY]: ${fieldName} } : {})`;
		}
		case 'InvalidAnnotations': {
			return `...(${fieldName}.length > 0 ? { [INVALID_ANNOTATION_KEY]: ${fieldName} } : {})`;
		}
		default: {
			const sanitizedFieldName = sanitizeVariableName(fieldName);
			return fieldName === sanitizedFieldName ? fieldName : `${fieldName}: ${sanitizedFieldName}`;
		}
	}
}

/**
 * @param {string} name
 * @returns {string}
 */
function sanitizeVariableName(name) {
	return name === 'arguments' ? 'arguments_' : name;
}

/**
 * @param {import('./ast-types.js').NodeDescription} node
 * @return {string[]}
 */
function getFixedProperties(node) {
	return Object.entries(node.fixed || {}).map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
}

const types = astNodeNamesWithFieldOrder.map(({ name }) => {
	const node = AST_NODES[name];
	let typeDefinition = `export type ${name}Node = estree.${node.estreeType || name} & AstNode`;
	if ((node.fields || []).some(([, fieldType]) => fieldType === 'Annotations')) {
		typeDefinition += ' & { [ANNOTATION_KEY]?: RollupAnnotation[] }';
	}
	if ((node.fields || []).some(([, fieldType]) => fieldType === 'InvalidAnnotations')) {
		typeDefinition += ' & { [INVALID_ANNOTATION_KEY]?: RollupAnnotation[] }';
	}
	const fixedProperties = getFixedProperties(node);
	if (fixedProperties.length > 0) {
		typeDefinition += ` & { ${fixedProperties.join(', ')} }`;
	}
	typeDefinition += ';';
	return typeDefinition;
});

const bufferToJsAst = `// This file is generated by scripts/generate-ast-converters.js.
// Do not edit this file directly.

import type * as estree from 'estree';
import type { AstNode } from '../rollup/types';
import { FIXED_STRINGS } from './convert-ast-strings';
import { error, logParseError } from './logs';

export const ANNOTATION_KEY = '_rollupAnnotations';
export const INVALID_ANNOTATION_KEY = '_rollupRemoved';

export function convertProgram(buffer: ArrayBuffer, readString: ReadString): ProgramNode {
  return convertNode(0, new Uint32Array(buffer), readString);
}

/* eslint-disable sort-keys */
const nodeConverters: ((position: number, buffer: Uint32Array, readString: ReadString) => any)[] = [
  ${jsConverters.join(',\n')}
];

type ReadString = (start: number, length: number) => string;
export type AnnotationType = 'pure' | 'noSideEffects';

export interface RollupAnnotation {
  start: number;
  end: number;
  type: AnnotationType;
}

${types.join('\n')}

function convertNode(position: number, buffer: Uint32Array, readString: ReadString): any {
  const nodeType = buffer[position];
  const converter = nodeConverters[nodeType];
  /* istanbul ignore if: This should never be executed but is a safeguard against faulty buffers */
  if (!converter) {
    console.trace();
    throw new Error(\`Unknown node type: \${nodeType}\`);
  }
  return converter(position + 1, buffer, readString);
}

function convertNodeList(position: number, buffer: Uint32Array, readString: ReadString): any[] {
  const length = buffer[position++];
  const list: any[] = [];
  for (let index = 0; index < length; index++) {
    const nodePosition = buffer[position++];
    list.push(nodePosition ? convertNode(nodePosition, buffer, readString) : null);
  }
  return list;
}

const convertAnnotations = (position: number, buffer: Uint32Array): RollupAnnotation[] => {
  const length = buffer[position++];
  const list: any[] = [];
  for (let index = 0; index < length; index++) {
    list.push(convertAnnotation(buffer[position++], buffer));
  }
  return list;
};

const convertAnnotation = (position: number, buffer: Uint32Array): RollupAnnotation => {
  const start = buffer[position++];
  const end = buffer[position++];
  const type = FIXED_STRINGS[buffer[position]] as AnnotationType;
  return { end, start, type };
};

const convertString = (position: number, buffer: Uint32Array, readString: ReadString): string => {
  const length = buffer[position++];
  const bytePosition = position << 2;
  return readString(bytePosition, length);
};
`;

await writeFile(bufferToJsAstFile, bufferToJsAst);
await lintFile(bufferToJsAstFile);
