import { writeFile } from 'node:fs/promises';
import { astNodeNamesWithFieldOrder } from './ast-types.js';
import { firstLetterLowercase, generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const bufferParsersFile = new URL('../src/ast/bufferParsers.ts', import.meta.url);

const nodeTypes = astNodeNamesWithFieldOrder.map(({ name, node }) => node.astType || name);

const nodeTypeImports = nodeTypes.map(name => `import ${name} from './nodes/${name}';`);
const nodeTypeStrings = nodeTypes.map(name => `\t'${name}'`);

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
	let offset = 0;
	let needsBuffer = false;
	let needsScope = false;
	if (node.flags) {
		offset++;
		needsBuffer = true;
		definitions.push(
			'const flags = buffer[position];\n',
			...node.flags.map((flagName, index) => {
				let assignmentLeftHand = node.baseForAdditionalFields?.includes(flagName)
					? `const ${flagName} = `
					: '';
				if (!node.hiddenFields?.includes(flagName)) {
					assignmentLeftHand += `node.${flagName} = `;
				}
				return `${assignmentLeftHand}(flags & ${1 << index}) === ${1 << index};`;
			})
		);
	}
	for (const [index, field] of fields.entries()) {
		const fieldDefinition = getFieldDefinition(field, node, originalNode, offset + index);
		needsBuffer = true;
		needsScope ||= fieldDefinition.needsScope;
		definitions.push(`${fieldDefinition.definition}\n`);
	}
	offset += fields.length;
	for (const [fieldName, fieldValue] of Object.entries(node.additionalFields || {})) {
		definitions.push(`node.${fieldName} = ${fieldValue};\n`);
	}
	for (const [fieldName, fallbackName] of Object.entries(node.optionalFallback || {})) {
		needsScope = true;
		definitions.push(
			`node.${fieldName} = ${fieldName}Position === 0 ? node.${fallbackName} : convertNode(node, scope, ${fieldName}Position, buffer, readString);\n`
		);
	}
	if (needsScope) {
		definitions.unshift('const {scope} = node;');
	}
	/** @type {string[]} */
	const parameters = [];
	if (definitions.length > 0) {
		parameters.push(`node: ${node.astType || name}`);
		if (needsBuffer) {
			parameters.push(`position, buffer${readStringArgument}`);
		}
	}
	return `function ${firstLetterLowercase(name)} (${parameters.join(', ')}) {
    ${definitions.join('')}}`;
});

/**
 * @param {import("./ast-types.js").FieldWithType} field
 * @param {import("./ast-types.js").NodeDescription} node
 * @param {import("./ast-types.js").NodeDescription} originalNode
 * @param {number} offset
 * @returns {{definition: string, needsScope: boolean}}
 */
function getFieldDefinition([fieldName, fieldType], node, originalNode, offset) {
	const getPosition = offset > 0 ? `position + ${offset}` : 'position';
	const dataStart = `buffer[${getPosition}]`;
	if (node.scriptedFields?.[fieldName]) {
		return {
			definition: node.scriptedFields?.[fieldName].replace(/\$position/g, dataStart),
			needsScope: true
		};
	}
	const typeCast = originalNode.fieldTypes?.[fieldName] || node.fieldTypes?.[fieldName];
	const typeCastString = typeCast ? ` as ${typeCast}` : '';
	let assignmentLeftHand = node.baseForAdditionalFields?.includes(fieldName)
		? `const ${fieldName} = `
		: '';
	if (!node.hiddenFields?.includes(fieldName)) {
		assignmentLeftHand += `node.${fieldName} = `;
	}
	const scope = originalNode?.scopes?.[fieldName] || node?.scopes?.[fieldName] || 'scope';
	switch (fieldType) {
		case 'Node': {
			return {
				definition: `${assignmentLeftHand}convertNode(node, ${scope}, ${dataStart}, buffer, readString)${typeCastString};`,
				needsScope: true
			};
		}
		case 'OptionalNode': {
			let definition = `const ${fieldName}Position = ${dataStart};`;
			let needsScope = false;
			if (!node.optionalFallback?.[fieldName]) {
				needsScope = true;
				let additionalDefinition = `\n${assignmentLeftHand}${fieldName}Position === 0 ? null : convertNode(node, ${scope}, ${fieldName}Position, buffer, readString)${typeCastString}`;
				if (node.postProcessFields?.[fieldName]) {
					const [variableName, postProcess] = node.postProcessFields[fieldName];
					additionalDefinition = `const ${variableName} = (${additionalDefinition});\n${postProcess}`;
				}
				definition += additionalDefinition;
			}
			return { definition, needsScope };
		}
		case 'NodeList': {
			let definition = `${assignmentLeftHand}convertNodeList(node, ${scope}, ${dataStart}, buffer, readString)${typeCastString}`;
			if (node.postProcessFields?.[fieldName]) {
				const [variableName, postProcess] = node.postProcessFields[fieldName];
				definition = `const ${variableName} = (${definition});\n${postProcess}`;
			}
			return {
				definition,
				needsScope: true
			};
		}
		case 'Annotations':
		case 'InvalidAnnotations': {
			let definition = `${assignmentLeftHand}convertAnnotations(${dataStart}, buffer)${typeCastString}`;
			if (node.postProcessFields?.[fieldName]) {
				const [variableName, postProcess] = node.postProcessFields[fieldName];
				definition = `const ${variableName} = (${definition});\n${postProcess}`;
			}
			return {
				definition,
				needsScope: false
			};
		}
		case 'String': {
			return {
				definition: `${assignmentLeftHand}convertString(${dataStart}, buffer, readString)${typeCastString};`,
				needsScope: false
			};
		}
		case 'OptionalString': {
			return {
				definition: `const ${fieldName}Position = ${dataStart};\n${assignmentLeftHand}${fieldName}Position === 0 ? undefined : convertString(${fieldName}Position, buffer, readString)${typeCastString};`,
				needsScope: false
			};
		}
		case 'FixedString': {
			return {
				definition: `${assignmentLeftHand}FIXED_STRINGS[${dataStart}]${typeCastString};`,
				needsScope: false
			};
		}
		case 'Float': {
			return {
				definition: `${assignmentLeftHand}new DataView(buffer.buffer).getFloat64((${getPosition}) << 2, true);`,
				needsScope: false
			};
		}
		default: {
			throw new Error(`Unknown field type: ${fieldType}`);
		}
	}
}

const bufferParsers = `${notEditFilesComment}
import type * as estree from 'estree';
import type { AstContext } from '../Module';
import { convertAnnotations, convertString } from '../utils/astConverterHelpers';
import { EMPTY_ARRAY } from '../utils/blank';
import { convertNode as convertJsonNode } from '../utils/bufferToAst';
import FIXED_STRINGS from '../utils/convert-ast-strings';
import type { ReadString } from '../utils/getReadStringFunction';
import getReadStringFunction from '../utils/getReadStringFunction';
${nodeTypeImports.join('\n')}
import { UNKNOWN_EXPRESSION } from './nodes/shared/Expression';
import type { Node, NodeBase } from './nodes/shared/Node';
import type ChildScope from './scopes/ChildScope';
import type ModuleScope from './scopes/ModuleScope';
import TrackingScope from './scopes/TrackingScope';
import type ParameterVariable from './variables/ParameterVariable';

export function convertProgram(
  buffer: Buffer | Uint8Array,
  parent: Node | { context: AstContext; type: string },
  parentScope: ModuleScope
): Program {
  return convertNode(
    parent,
    parentScope,
    0,
    new Uint32Array(buffer.buffer),
    getReadStringFunction(buffer)
  );
}

const nodeTypeStrings = [
  ${nodeTypeStrings.join(',\n')}
] as const;

const nodeConstructors: (typeof NodeBase)[] = [
  ${nodeTypes.join(',\n')}
];

const bufferParsers: ((node: any, position: number, buffer: Uint32Array, readString: ReadString) => void)[] = [
  ${jsConverters.join(',\n')}
];

function convertNode(parent: Node | { context: AstContext; type: string }, parentScope: ChildScope, position: number, buffer: Uint32Array, readString: ReadString): any {
  const nodeType = buffer[position];
  const NodeConstructor = nodeConstructors[nodeType];
  /* istanbul ignore if: This should never be executed but is a safeguard against faulty buffers */
  if (!NodeConstructor) {
    console.trace();
    throw new Error(\`Unknown node type: $\{nodeType}\`);
  }
  const node = new NodeConstructor(parent, parentScope);
  node.type = nodeTypeStrings[nodeType];
  node.start = buffer[position + 1];
  node.end = buffer[position + 2];
  bufferParsers[nodeType](node, position + 3, buffer, readString);
  node.initialise();
  return node;
}

function convertNodeList(parent: Node | { context: AstContext; type: string }, parentScope: ChildScope, position: number, buffer: Uint32Array, readString: ReadString): any[] {
  if (position === 0) return EMPTY_ARRAY as never[];
  const length = buffer[position++];
  const list: any[] = [];
  for (let index = 0; index < length; index++) {
    const nodePosition = buffer[position++];
    list.push(nodePosition ? convertNode(parent, parentScope, nodePosition, buffer, readString) : null);
  }
  return list;
}
`;

await writeFile(bufferParsersFile, bufferParsers);
await lintTsFile(bufferParsersFile);
