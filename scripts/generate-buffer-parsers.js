import { writeFile } from 'node:fs/promises';
import { AST_NODES, astNodeNamesWithFieldOrder } from './ast-types.js';
import { getNode } from './generate-buffer-to-ast.js';
import { firstLetterLowercase, lintFile } from './helpers.js';

const bufferParsersFile = new URL('../src/ast/bufferParsers.ts', import.meta.url);

const nodeTypes = [
	'ParseError',
	...astNodeNamesWithFieldOrder.map(({ name }) => getNode(name).astType || name)
];

const nodeTypeImports = nodeTypes.map(name => `import ${name} from './nodes/${name}';`);
const nodeTypeStrings = nodeTypes.map(name => `\t'${name}'`);

const jsConverters = [
	`function parseError (_node, position, buffer, readString): void {
    const pos = buffer[position++];
    const message = convertString(position, buffer, readString);
    error(logParseError(message, pos));
	}`,
	...astNodeNamesWithFieldOrder.map(({ name, inlinedVariableField, reservedFields, allFields }) => {
		const node = getNode(name);
		const readStringArgument = allFields.some(([, fieldType]) =>
			['Node', 'OptionalNode', 'NodeList', 'String', 'FixedString', 'OptionalString'].includes(
				fieldType
			)
		)
			? ', readString'
			: '';
		/** @type {string[]} */
		const definitions = [];
		let needsScope = false;
		if (node.flags) {
			definitions.push(
				'const flags = buffer[position++];\n',
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
		for (const [index, field] of reservedFields.entries()) {
			const fieldDefinition = getFieldDefinition(
				field,
				name,
				false,
				index === allFields.length - 1
			);
			needsScope ||= fieldDefinition.needsScope;
			definitions.push(`${fieldDefinition.definition}\n`);
		}
		if (inlinedVariableField) {
			const fieldDefinition = getFieldDefinition(inlinedVariableField, name, true, true);
			needsScope ||= fieldDefinition.needsScope;
			definitions.push(`${fieldDefinition.definition}\n`);
		}
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
		const parameters =
			definitions.length > 0
				? `node: ${node.astType || name}, position, buffer${readStringArgument}`
				: '';
		return `function ${firstLetterLowercase(name)} (${parameters}) {
    ${definitions.join('')}}`;
	})
];

/**
 * @param {import('./ast-types.js').FieldWithType} field
 * @param {string} name
 * @param {boolean} isInlined
 * @param {boolean} isLastField
 * @returns {{definition: string, needsScope: boolean}}
 */
function getFieldDefinition([fieldName, fieldType], name, isInlined, isLastField) {
	const originalNode = AST_NODES[name];
	const node = getNode(name);
	const typeCast = originalNode.fieldTypes?.[fieldName] || node.fieldTypes?.[fieldName];
	const typeCastString = typeCast ? ` as ${typeCast}` : '';
	const getAndUpdatePosition = isLastField ? 'position' : 'position++';
	const dataStart = isInlined ? getAndUpdatePosition : `buffer[${getAndUpdatePosition}]`;
	let assignmentLeftHand = node.baseForAdditionalFields?.includes(fieldName)
		? `const ${fieldName} = `
		: '';
	if (!node.hiddenFields?.includes(fieldName)) {
		assignmentLeftHand += `node.${fieldName} = `;
	}
	switch (fieldType) {
		case 'Node': {
			return {
				definition: `${assignmentLeftHand}convertNode(node, scope, ${dataStart}, buffer, readString)${typeCastString};`,
				needsScope: true
			};
		}
		case 'OptionalNode': {
			let definition = `const ${fieldName}Position = buffer[${getAndUpdatePosition}];`;
			let needsScope = false;
			if (!node.optionalFallback?.[fieldName]) {
				needsScope = true;
				definition += `\n${assignmentLeftHand}${fieldName}Position === 0 ? null : convertNode(node, scope, ${fieldName}Position, buffer, readString)${typeCastString};`;
			}
			return { definition, needsScope };
		}
		case 'NodeList': {
			return {
				definition: `${assignmentLeftHand}convertNodeList(node, scope, ${dataStart}, buffer, readString)${typeCastString};`,
				needsScope: true
			};
		}
		case 'Annotations':
		case 'InvalidAnnotations': {
			return {
				definition: `${assignmentLeftHand}convertAnnotations(${dataStart}, buffer)${typeCastString};`,
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
				definition: `const ${fieldName}Position = buffer[${getAndUpdatePosition}];\n${assignmentLeftHand}${fieldName}Position === 0 ? undefined : convertString(${fieldName}Position, buffer, readString)${typeCastString};`,
				needsScope: false
			};
		}
		case 'FixedString': {
			return {
				definition: `${assignmentLeftHand}FIXED_STRINGS[buffer[${getAndUpdatePosition}]]${typeCastString};`,
				needsScope: false
			};
		}
		case 'Float': {
			return {
				definition: `${assignmentLeftHand}new DataView(buffer.buffer).getFloat64(${getAndUpdatePosition} << 2, true);`,
				needsScope: false
			};
		}
		default: {
			throw new Error(`Unknown field type: ${fieldType}`);
		}
	}
}

const bufferParsers = `// This file is generated by scripts/generate-ast-converters.js.
// Do not edit this file directly.

import type * as estree from 'estree';
import type { AstContext } from '../Module';
import { convertAnnotations, convertString } from '../utils/astConverterHelpers';
import { FIXED_STRINGS } from '../utils/convert-ast-strings';
import type { ReadString } from '../utils/getReadStringFunction';
import { error, logParseError } from '../utils/logs';
${nodeTypeImports.join('\n')}
import type { Node, NodeBase } from './nodes/shared/Node';
import type ChildScope from './scopes/ChildScope';

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
  return node;
}

function convertNodeList(parent: Node | { context: AstContext; type: string }, parentScope: ChildScope, position: number, buffer: Uint32Array, readString: ReadString): any[] {
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
await lintFile(bufferParsersFile);
