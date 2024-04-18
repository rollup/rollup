import { writeFile } from 'node:fs/promises';
import { astNodeNamesWithFieldOrder } from './ast-types.js';
import { firstLetterLowercase, generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const bufferToJsAstFile = new URL('../src/utils/bufferToAst.ts', import.meta.url);

const jsConverters = astNodeNamesWithFieldOrder.map(({ name, fields, node, originalNode }) => {
	const readStringArgument = fields.some(([, fieldType]) =>
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
				(name, index) =>
					`const ${node.variableNames?.[name] || name} = (flags & ${1 << index}) === ${1 << index};`
			)
		);
	}
	for (const [index, field] of fields.entries()) {
		definitions.push(
			`${getFieldDefinition(field, node, originalNode, index === fields.length - 1)}\n`
		);
	}
	/** @type {string[]} */
	const properties = [
		...(node.flags || []).map(name => {
			const alternativeVariableName = node.variableNames?.[name];
			return alternativeVariableName ? `${name}: ${alternativeVariableName}` : name;
		}),
		...fields
			.filter(([fieldName]) => !node.hiddenFields?.includes(fieldName))
			.map(field => getFieldProperty(field, node)),
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
});

/**
 * @param {import("./ast-types.js").FieldWithType} field
 * @param {import("./ast-types.js").NodeDescription} node
 * @param {import("./ast-types.js").NodeDescription} originalNode
 * @param {boolean} isLastField
 * @returns {string}
 */
function getFieldDefinition([fieldName, fieldType], node, originalNode, isLastField) {
	const typeCast = originalNode.fieldTypes?.[fieldName] || node.fieldTypes?.[fieldName];
	const typeCastString = typeCast ? ` as ${typeCast}` : '';
	const getAndUpdatePosition = isLastField ? 'position' : 'position++';
	const dataStart = `buffer[${getAndUpdatePosition}]`;
	const variableName = node.variableNames?.[fieldName] || fieldName;
	switch (fieldType) {
		case 'Node': {
			return `const ${variableName} = convertNode(${dataStart}, buffer, readString)${typeCastString};`;
		}
		case 'OptionalNode': {
			let definition = `const ${fieldName}Position = ${dataStart};`;
			if (!node.optionalFallback?.[fieldName]) {
				definition += `\nconst ${variableName} = ${fieldName}Position === 0 ? null : convertNode(${fieldName}Position, buffer, readString)${typeCastString};`;
			}
			return definition;
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
			return `const ${fieldName}Position = ${dataStart};\nconst ${variableName} = ${fieldName}Position === 0 ? undefined : convertString(${fieldName}Position, buffer, readString)${typeCastString};`;
		}
		case 'FixedString': {
			return `const ${variableName} = FIXED_STRINGS[${dataStart}]${typeCastString};`;
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
 * @param {import("./ast-types.js").FieldWithType} field
 * @param {import("./ast-types.js").NodeDescription} node
 * @returns {string}
 */
function getFieldProperty([fieldName, fieldType], node) {
	switch (fieldType) {
		case 'Annotations': {
			return `...(${fieldName}.length > 0 ? { [ANNOTATION_KEY]: ${fieldName} } : {})`;
		}
		case 'InvalidAnnotations': {
			return `...(${fieldName}.length > 0 ? { [INVALID_ANNOTATION_KEY]: ${fieldName} } : {})`;
		}
		default: {
			const variableName = node.variableNames?.[fieldName] || fieldName;
			const fallback = node.optionalFallback?.[fieldName];
			const value = fallback
				? `${fieldName}Position === 0 ? { ...${fallback} } : convertNode(${fieldName}Position, buffer, readString)`
				: variableName;
			return value === fieldName ? fieldName : `${fieldName}: ${value}`;
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
import {
  ANNOTATION_KEY,
  convertAnnotations,
  convertString,
  INVALID_ANNOTATION_KEY
} from './astConverterHelpers';
import { EMPTY_ARRAY } from '../utils/blank';
import FIXED_STRINGS from './convert-ast-strings';
import type { ReadString } from './getReadStringFunction';
import { error, getRollupError, logParseError } from './logs';

export function convertProgram(buffer: ArrayBuffer, readString: ReadString): ProgramNode {
  const node = convertNode(0, new Uint32Array(buffer), readString);
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
const nodeConverters: ((position: number, buffer: Uint32Array, readString: ReadString) => any)[] = [
  ${jsConverters.join(',\n')}
];

${types.join('\n')}

export function convertNode(position: number, buffer: Uint32Array, readString: ReadString): any {
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
  if (position === 0) return EMPTY_ARRAY as never[];
  const length = buffer[position++];
  const list: any[] = [];
  for (let index = 0; index < length; index++) {
    const nodePosition = buffer[position++];
    list.push(nodePosition ? convertNode(nodePosition, buffer, readString) : null);
  }
  return list;
}
`;

await writeFile(bufferToJsAstFile, bufferToJsAst);
await lintTsFile(bufferToJsAstFile);
