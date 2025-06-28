import { writeFile } from 'node:fs/promises';
import type { FieldDescription, NodeDescription } from './ast-types.js';
import { astNodeNamesWithFieldOrder } from './ast-types.js';
import { firstLettersLowercase, generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const bufferParsersFile = new URL('../src/ast/bufferParsers.ts', import.meta.url);

const nodeTypes = astNodeNamesWithFieldOrder.map(({ name, node }) => node.astType || name);

const nodeTypeImports = nodeTypes.map(name => `import ${name} from './nodes/${name}';`);
const nodeTypeStrings = nodeTypes.map(name => `\t'${name}'`);

const jsConverters = astNodeNamesWithFieldOrder.map(({ name, fields, node, originalNode }) => {
	const definitions: string[] = [];
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
		const fieldDefinition = getFieldDefinition(field, name, node, originalNode, offset + index);
		needsBuffer = true;
		needsScope ||= fieldDefinition.needsScope;
		definitions.push(`${fieldDefinition.definition}\n`);
	}
	for (const [fieldName, { value: fieldValue }] of Object.entries(node.additionalFields || {})) {
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
	const parameters: string[] = [];
	if (definitions.length > 0) {
		parameters.push(`node: ${node.astType || name}`);
		if (needsBuffer) {
			parameters.push('position, buffer');
		}
	}
	return `function ${node.converterFunction || firstLettersLowercase(name)} (${parameters.join(', ')}) {
    ${definitions.join('')}}`;
});

function getFieldDefinition(
	field: FieldDescription,
	nodeName: string,
	node: NodeDescription,
	originalNode: NodeDescription,
	offset: number
): { definition: string; needsScope: boolean } {
	const getPosition = offset > 0 ? `position + ${offset}` : 'position';
	const dataStart = `buffer[${getPosition}]`;
	if (node.scriptedFields?.[field.name]) {
		return {
			definition: node.scriptedFields?.[field.name]
				.replace(/\$position/g, dataStart)
				.replace(
					/\$type([A-Z]\w+)\b/g,
					(_, typeName) =>
						`${astNodeNamesWithFieldOrder.findIndex(astNode => astNode.name === typeName)}`
				),
			needsScope: true
		};
	}
	let assignmentLeftHand = node.baseForAdditionalFields?.includes(field.name)
		? `const ${field.name} = `
		: '';
	if (!node.hiddenFields?.includes(field.name)) {
		assignmentLeftHand += `node.${field.name} = `;
	}
	const scope = originalNode?.scopes?.[field.name] || node?.scopes?.[field.name] || 'scope';
	switch (field.type) {
		case 'Node': {
			if (field.allowNull) {
				let definition = `const ${field.name}Position = ${dataStart};`;
				let needsScope = false;
				if (!node.optionalFallback?.[field.name]) {
					needsScope = true;
					let additionalDefinition = `\n${assignmentLeftHand}${field.name}Position === 0 ? null : convertNode(node, ${scope}, ${field.name}Position, buffer)`;
					if (node.postProcessFields?.[field.name]) {
						const [variableName, postProcess] = node.postProcessFields[field.name];
						additionalDefinition = `const ${variableName} = (${additionalDefinition});\n${postProcess}`;
					}
					definition += additionalDefinition;
				}
				return { definition, needsScope };
			}
			return {
				definition: `${assignmentLeftHand}convertNode(node, ${scope}, ${dataStart}, buffer);`,
				needsScope: true
			};
		}
		case 'NodeList': {
			let definition = `${assignmentLeftHand}convertNodeList(node, ${scope}, ${dataStart}, buffer)`;
			if (node.postProcessFields?.[field.name]) {
				const [variableName, postProcess] = node.postProcessFields[field.name];
				definition = `const ${variableName} = (${definition});\n${postProcess}`;
			}
			return {
				definition,
				needsScope: true
			};
		}
		case 'Annotations': {
			let definition = `${assignmentLeftHand}convertAnnotations(${dataStart}, buffer)`;
			if (node.postProcessFields?.[field.name]) {
				const [variableName, postProcess] = node.postProcessFields[field.name];
				definition = `const ${variableName} = (${definition});\n${postProcess}`;
			}
			return {
				definition,
				needsScope: false
			};
		}
		case 'String': {
			if (field.optional) {
				return {
					definition: `const ${field.name}Position = ${dataStart};\n${assignmentLeftHand}${field.name}Position === 0 ? undefined : buffer.convertString(${field.name}Position);`,
					needsScope: false
				};
			}
			return {
				definition: `${assignmentLeftHand}buffer.convertString(${dataStart});`,
				needsScope: false
			};
		}
		case 'FixedString': {
			return {
				definition: `${assignmentLeftHand}FIXED_STRINGS[${dataStart}] as ast.${nodeName}['${field.name}'];`,
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
			throw new Error(`Unhandled field type ${(field as { type: string }).type}`);
		}
	}
}

const bufferParsers = `${notEditFilesComment}
import type { ast } from '../rollup/types';
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
  parent: Node | null,
  parentScope: ModuleScope
): Program {
  return convertNode(parent, parentScope, 0, getAstBuffer(buffer));
}

const nodeTypeStrings = [
  ${nodeTypeStrings.join(',\n')}
] as const;

const nodeConstructors = [
  ${nodeTypes.join(',\n')}
] as const;

const bufferParsers: ((node: any, position: number, buffer: AstBuffer) => void)[] = [
  ${jsConverters.join(',\n')}
];

function convertNode(
  parent: Node | null,
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
  node.type = nodeTypeStrings[nodeType] as any;
  node.start = buffer[position + 1];
  node.end = buffer[position + 2];
  bufferParsers[nodeType](node, position + 3, buffer);
  node.initialise();
  return node;
}

function convertNodeList(
  parent: Node | null,
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
