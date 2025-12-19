import { writeFile } from 'node:fs/promises';
import { astNodeNamesWithFieldOrder } from './ast-types.js';
import { firstLettersLowercase, generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const bufferParsersFile = new URL('../src/ast/bufferParsers.ts', import.meta.url);

const nodeTypes = astNodeNamesWithFieldOrder.map(({ name, node }) => node.astType || name);

const nodeTypeImports = nodeTypes.map(name => `import ${name} from './nodes/${name}';`);
const nodeTypeStrings = nodeTypes.map(name => `\t'${name}'`);

const jsConverters = astNodeNamesWithFieldOrder.map(({ name, fields, node, originalNode }) => {
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
			`node.${fieldName} = ${fieldName}Position === 0 ? node.${fallbackName} : convertNode(node, scope, ${fieldName}Position, buffer);\n`
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
			parameters.push('position, buffer');
		}
	}
	return `function ${firstLettersLowercase(name)} (${parameters.join(', ')}) {
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
			definition: node.scriptedFields?.[fieldName]
				.replace(/\$position/g, dataStart)
				.replace(
					/\$type([A-Z]\w+)\b/g,
					(_, typeName) =>
						`${astNodeNamesWithFieldOrder.findIndex(astNode => astNode.name === typeName)}`
				),
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
				definition: `${assignmentLeftHand}convertNode(node, ${scope}, ${dataStart}, buffer)${typeCastString};`,
				needsScope: true
			};
		}
		case 'OptionalNode': {
			let definition = `const ${fieldName}Position = ${dataStart};`;
			let needsScope = false;
			if (!node.optionalFallback?.[fieldName]) {
				needsScope = true;
				let additionalDefinition = `\n${assignmentLeftHand}${fieldName}Position === 0 ? null : convertNode(node, ${scope}, ${fieldName}Position, buffer)${typeCastString}`;
				if (node.postProcessFields?.[fieldName]) {
					const [variableName, postProcess] = node.postProcessFields[fieldName];
					additionalDefinition = `const ${variableName} = (${additionalDefinition});\n${postProcess}`;
				}
				definition += additionalDefinition;
			}
			return { definition, needsScope };
		}
		case 'NodeList': {
			let definition = `${assignmentLeftHand}convertNodeList(node, ${scope}, ${dataStart}, buffer)${typeCastString}`;
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
				definition: `${assignmentLeftHand}buffer.convertString(${dataStart})${typeCastString};`,
				needsScope: false
			};
		}
		case 'OptionalString':
		case 'NullableString': {
			return {
				definition: `const ${fieldName}Position = ${dataStart};\n${assignmentLeftHand}${fieldName}Position === 0 ? ${fieldType === 'OptionalString' ? 'undefined' : 'null'} : buffer.convertString(${fieldName}Position)${typeCastString};`,
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
import { convertAnnotations } from '../utils/astConverterHelpers';
import { EMPTY_ARRAY } from '../utils/blank';
import { convertNode as convertJsonNode } from '../utils/bufferToAst';
import FIXED_STRINGS from '../utils/convert-ast-strings';
import type { AstBuffer } from '../utils/getAstBuffer';
import { getAstBuffer } from '../utils/getAstBuffer';
${nodeTypeImports.join('\n')}
import { UNKNOWN_EXPRESSION } from './nodes/shared/Expression';
import type { Node, NodeBase } from './nodes/shared/Node';
import type ChildScope from './scopes/ChildScope';
import type ModuleScope from './scopes/ModuleScope';
import TrackingScope from './scopes/TrackingScope';
import { EMPTY_PATH } from './utils/PathTracker';
import type ParameterVariable from './variables/ParameterVariable';

export function convertProgram(
  buffer: Buffer | Uint8Array,
  parent: Node | { context: AstContext; type: string },
  parentScope: ModuleScope
): Program {
  return convertNode(parent, parentScope, 0, getAstBuffer(buffer));
}

const nodeTypeStrings = [
  ${nodeTypeStrings.join(',\n')}
] as const;

const nodeConstructors: (typeof NodeBase)[] = [
  ${nodeTypes.join(',\n')}
];

const bufferParsers: ((node: any, position: number, buffer: AstBuffer) => void)[] = [
  ${jsConverters.join(',\n')}
];

function convertNode(
  parent: Node | { context: AstContext; type: string },
  parentScope: ChildScope,
  position: number,
  buffer: AstBuffer
): any {
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
  bufferParsers[nodeType](node, position + 3, buffer);
  node.initialise();
  return node;
}

function convertNodeList(
  parent: Node | { context: AstContext; type: string },
  parentScope: ChildScope,
  position: number,
  buffer: AstBuffer
): any[] {
  if (position === 0) return EMPTY_ARRAY as never[];
  const length = buffer[position++];
  const list: any[] = new Array(length);
  for (let index = 0; index < length; index++) {
    const nodePosition = buffer[position++];
    list[index] = nodePosition ? convertNode(parent, parentScope, nodePosition, buffer) : null;
  }
  return list;
}
`;

await writeFile(bufferParsersFile, bufferParsers);
await lintTsFile(bufferParsersFile);
