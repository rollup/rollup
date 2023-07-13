import type * as estree from 'estree';
import type { AcornNode } from '../rollup/types';

type ReadString = (start: number, length: number) => string;

export const convertProgram = (buffer: ArrayBuffer, readString: ReadString): any =>
	convertNode(0, new Uint32Array(buffer), readString);

const convertNode = (position: number, buffer: Uint32Array, readString: ReadString): any => {
	const nodeType = buffer[position];
	const converter = nodeConverters[nodeType];
	if (!converter) {
		console.trace();
		throw new Error(`Unknown node type: ${nodeType}`);
	}
	return converter(position + 1, buffer, readString);
};

const nodeConverters: ((position: number, buffer: Uint32Array, readString: ReadString) => any)[] = [
	// ArrayExpression
	(position, buffer, readString): estree.ArrayExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const elements = convertNodeList(position, buffer, readString);
		return {
			elements,
			end,
			start,
			type: 'ArrayExpression'
		};
	},
	// ArrayPattern
	(position, buffer, readString): estree.ArrayPattern & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const elements = convertNodeList(position, buffer, readString);
		return {
			elements,
			end,
			start,
			type: 'ArrayPattern'
		};
	},
	// ArrowFunctionExpression
	(
		position,
		buffer,
		readString
	): estree.ArrowFunctionExpression &
		AcornNode & {
			id: null;
		} => {
		const start = buffer[position++];
		const end = buffer[position++];
		const async = !!buffer[position++];
		const generator = !!buffer[position++];
		const parameters = convertNodeList(buffer[position++], buffer, readString);
		const expression = !!buffer[position++];
		const body = convertNode(position, buffer, readString);
		return {
			async,
			body,
			end,
			expression,
			generator,
			// acorn adds this for weird reasons
			id: null,
			params: parameters,
			start,
			type: 'ArrowFunctionExpression'
		};
	},
	// AssignmentExpression
	(position, buffer, readString): estree.AssignmentExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const left = convertNode(buffer[position++], buffer, readString);
		const right = convertNode(buffer[position++], buffer, readString);
		const operator = convertString(position, buffer, readString) as estree.AssignmentOperator;
		return {
			end,
			left,
			operator,
			right,
			start,
			type: 'AssignmentExpression'
		};
	},
	// AssignmentPattern
	(position, buffer, readString): estree.AssignmentPattern & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const left = convertNode(buffer[position++], buffer, readString);
		const right = convertNode(position, buffer, readString);
		return {
			end,
			left,
			right,
			start,
			type: 'AssignmentPattern'
		};
	},
	// AwaitExpression
	(position, buffer, readString): estree.AwaitExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const argument = convertNode(position, buffer, readString);
		return {
			argument,
			end,
			start,
			type: 'AwaitExpression'
		};
	},
	// BinaryExpression
	(position, buffer, readString): estree.BinaryExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const left = convertNode(buffer[position++], buffer, readString);
		const right = convertNode(buffer[position++], buffer, readString);
		const operator = convertString(position, buffer, readString) as estree.BinaryOperator;
		return {
			end,
			left,
			operator,
			right,
			start,
			type: 'BinaryExpression'
		};
	},
	// BlockStatement
	(position, buffer, readString): estree.BlockStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const body = convertNodeList(position, buffer, readString);
		return {
			body,
			end,
			start,
			type: 'BlockStatement'
		};
	},
	// BreakStatement
	(position, buffer, readString): estree.BreakStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const labelPosition = buffer[position++];
		return {
			end,
			label: labelPosition ? convertNode(labelPosition, buffer, readString) : null,
			start,
			type: 'BreakStatement'
		};
	},
	// CallExpression
	(position, buffer, readString): estree.CallExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const optional = !!buffer[position++];
		const callee = convertNode(buffer[position++], buffer, readString);
		const argumentsList = convertNodeList(position, buffer, readString);
		return {
			arguments: argumentsList,
			callee,
			end,
			optional,
			start,
			type: 'CallExpression'
		};
	},
	// CatchClause
	(position, buffer, readString): estree.CatchClause & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const parameterPosition = buffer[position++];
		const body = convertNode(position, buffer, readString);
		return {
			body,
			end,
			param: parameterPosition ? convertNode(parameterPosition, buffer, readString) : null,
			start,
			type: 'CatchClause'
		};
	},
	// ChainExpression
	(position, buffer, readString): estree.ChainExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const expression = convertNode(position, buffer, readString);
		return {
			end,
			expression,
			start,
			type: 'ChainExpression'
		};
	},
	// ClassBody
	(position, buffer, readString): estree.ClassBody & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const body = convertNodeList(position, buffer, readString);
		return {
			body,
			end,
			start,
			type: 'ClassBody'
		};
	},
	// ClassDeclaration
	(position, buffer, readString): estree.ClassDeclaration & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const idPosition = buffer[position++];
		const superClassPosition = buffer[position++];
		const body = convertNode(buffer[position], buffer, readString);
		return {
			body,
			end,
			id: idPosition ? convertNode(idPosition, buffer, readString) : null,
			start,
			superClass: superClassPosition ? convertNode(superClassPosition, buffer, readString) : null,
			type: 'ClassDeclaration'
		};
	},
	// ClassExpression
	(position, buffer, readString): estree.ClassExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const idPosition = buffer[position++];
		const superClassPosition = buffer[position++];
		const body = convertNode(buffer[position], buffer, readString);
		return {
			body,
			end,
			id: idPosition ? convertNode(idPosition, buffer, readString) : null,
			start,
			superClass: superClassPosition ? convertNode(superClassPosition, buffer, readString) : null,
			type: 'ClassExpression'
		};
	},
	// ConditionalExpression
	(position, buffer, readString): estree.ConditionalExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const test = convertNode(buffer[position++], buffer, readString);
		const consequent = convertNode(buffer[position++], buffer, readString);
		const alternate = convertNode(position, buffer, readString);
		return {
			alternate,
			consequent,
			end,
			start,
			test,
			type: 'ConditionalExpression'
		};
	},
	// ContinueStatement
	(position, buffer, readString): estree.ContinueStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const labelPosition = buffer[position];
		return {
			end,
			label: labelPosition ? convertNode(labelPosition, buffer, readString) : null,
			start,
			type: 'ContinueStatement'
		};
	},
	// DebuggerStatement
	(position, buffer): estree.DebuggerStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		return {
			end,
			start,
			type: 'DebuggerStatement'
		};
	},
	// DoWhileStatement
	(position, buffer, readString): estree.DoWhileStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const test = convertNode(buffer[position++], buffer, readString);
		const body = convertNode(position, buffer, readString);
		return {
			body,
			end,
			start,
			test,
			type: 'DoWhileStatement'
		};
	},
	// EmptyStatement
	(position, buffer): estree.EmptyStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		return {
			end,
			start,
			type: 'EmptyStatement'
		};
	},
	// ExportAllDeclaration
	(
		position,
		buffer,
		readString
	): estree.ExportAllDeclaration & AcornNode & { source: AcornNode & estree.Literal } => {
		const start = buffer[position++];
		const end = buffer[position++];
		const source = convertNode(position, buffer, readString);
		return {
			end,
			exported: null,
			source,
			start,
			type: 'ExportAllDeclaration'
		};
	},
	// ExportDefaultDeclaration
	(position, buffer, readString): estree.ExportDefaultDeclaration & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const declaration = convertNode(position, buffer, readString);
		return {
			declaration,
			end,
			start,
			type: 'ExportDefaultDeclaration'
		};
	},
	// ExportNamedDeclaration
	(position, buffer, readString): estree.ExportNamedDeclaration & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const declarationPosition = buffer[position++];
		const sourcePosition = buffer[position++];
		const specifiers = convertNodeList(position, buffer, readString);
		return {
			declaration: declarationPosition
				? convertNode(declarationPosition, buffer, readString)
				: null,
			end,
			source: sourcePosition ? convertNode(sourcePosition, buffer, readString) : null,
			specifiers,
			start,
			type: 'ExportNamedDeclaration'
		};
	},
	// ExportSpecifier
	(position, buffer, readString): estree.ExportSpecifier & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const exportedPosition = buffer[position++];
		const local = convertNode(position, buffer, readString);
		const exported = exportedPosition ? convertNode(exportedPosition, buffer, readString) : local;
		return {
			end,
			exported,
			local,
			start,
			type: 'ExportSpecifier'
		};
	},
	// ExpressionStatement
	(position, buffer, readString): estree.ExpressionStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const expression = convertNode(position, buffer, readString);
		return {
			end,
			expression,
			start,
			type: 'ExpressionStatement'
		};
	},
	// ForInStatement
	(position, buffer, readString): estree.ForInStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const left = convertNode(buffer[position++], buffer, readString);
		const right = convertNode(buffer[position++], buffer, readString);
		const body = convertNode(position, buffer, readString);
		return {
			body,
			end,
			left,
			right,
			start,
			type: 'ForInStatement'
		};
	},
	// ForOfStatement
	(position, buffer, readString): estree.ForOfStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const awaited = !!buffer[position++];
		const left = convertNode(buffer[position++], buffer, readString);
		const right = convertNode(buffer[position++], buffer, readString);
		const body = convertNode(position, buffer, readString);
		return {
			await: awaited,
			body,
			end,
			left,
			right,
			start,
			type: 'ForOfStatement'
		};
	},
	// ForStatement
	(position, buffer, readString): estree.ForStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const initPosition = buffer[position++];
		const testPosition = buffer[position++];
		const updatePosition = buffer[position++];
		const body = convertNode(position, buffer, readString);
		return {
			body,
			end,
			init: initPosition ? convertNode(initPosition, buffer, readString) : null,
			start,
			test: testPosition ? convertNode(testPosition, buffer, readString) : null,
			type: 'ForStatement',
			update: updatePosition ? convertNode(updatePosition, buffer, readString) : null
		};
	},
	// Module -> Program
	(position, buffer, readString): estree.Program & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const body = convertNodeList(position, buffer, readString);
		return {
			body,
			end,
			sourceType: 'module',
			start,
			type: 'Program'
		};
	},
	// Number -> Literal
	(position, buffer, readString): estree.Literal & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const rawPosition = buffer[position++];
		const raw = rawPosition ? convertString(rawPosition, buffer, readString) : undefined;
		const value = new DataView(buffer.buffer).getFloat64(position << 2, true);
		return {
			end,
			raw,
			start,
			type: 'Literal',
			value
		};
	},
	// VariableDeclaration
	(position, buffer, readString): estree.VariableDeclaration & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const kind = DECLARATION_KINDS[buffer[position++]];
		const declarations = convertNodeList(position, buffer, readString);
		return {
			declarations,
			end,
			kind,
			start,
			type: 'VariableDeclaration'
		};
	},
	// VariableDeclarator
	(position, buffer, readString): estree.VariableDeclarator & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const init_position = buffer[position++];
		const id = convertNode(position, buffer, readString);
		return {
			end,
			id,
			init: init_position ? convertNode(init_position, buffer, readString) : null,
			start,
			type: 'VariableDeclarator'
		};
	},
	// Identifier
	(position, buffer, readString): estree.Identifier & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const name = convertString(position, buffer, readString);
		return {
			end,
			name,
			start,
			type: 'Identifier'
		};
	},
	// String -> Literal
	(position, buffer, readString): estree.Literal & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const rawPosition = buffer[position++];
		const raw = rawPosition ? convertString(rawPosition, buffer, readString) : undefined;
		const value = convertString(position, buffer, readString);
		return {
			end,
			raw,
			start,
			type: 'Literal',
			value
		};
	},
	// ImportDeclaration
	(position, buffer, readString): estree.ImportDeclaration & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const source = convertNode(buffer[position++], buffer, readString);
		const specifiers = convertNodeList(position, buffer, readString);
		return {
			end,
			source,
			specifiers,
			start,
			type: 'ImportDeclaration'
		};
	},
	// ImportNamedSpecifier -> ImportSpecifier
	(position, buffer, readString): estree.ImportSpecifier & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const importedPosition = buffer[position++];
		const local = convertNode(position, buffer, readString);
		const imported = importedPosition ? convertNode(importedPosition, buffer, readString) : local;
		return {
			end,
			imported,
			local,
			start,
			type: 'ImportSpecifier'
		};
	},
	// SpreadElement
	(position, buffer, readString): estree.SpreadElement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const argument = convertNode(buffer[position++], buffer, readString);
		return {
			argument,
			end,
			start,
			type: 'SpreadElement'
		};
	},
	// MemberExpression
	(position, buffer, readString): estree.MemberExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const optional = !!buffer[position++];
		const object = convertNode(buffer[position++], buffer, readString);
		const computed = !!buffer[position++];
		const property = convertNode(position, buffer, readString);
		return {
			computed,
			end,
			object,
			optional,
			property,
			start,
			type: 'MemberExpression'
		};
	},
	// PrivateName -> PrivateIdentifier
	(position, buffer, readString): estree.PrivateIdentifier & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const name = convertNode(position, buffer, readString);
		return {
			end,
			name,
			start,
			type: 'PrivateIdentifier'
		};
	},
	// ImportDefaultSpecifier
	(position, buffer, readString): estree.ImportDefaultSpecifier & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const local = convertNode(position, buffer, readString);
		return {
			end,
			local,
			start,
			type: 'ImportDefaultSpecifier'
		};
	},
	// Boolean -> Literal
	(position, buffer): estree.Literal & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const value = !!buffer[position++];
		return {
			end,
			raw: value ? 'true' : 'false',
			start,
			type: 'Literal',
			value
		};
	},
	// Null -> Literal
	(position, buffer): estree.Literal & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		return {
			end,
			raw: 'null',
			start,
			type: 'Literal',
			value: null
		};
	},
	// ImportNamespaceSpecifier
	(position, buffer, readString): estree.ImportNamespaceSpecifier & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const local = convertNode(position, buffer, readString);
		return {
			end,
			local,
			start,
			type: 'ImportNamespaceSpecifier'
		};
	},
	// ObjectPattern
	(position, buffer, readString): estree.ObjectPattern & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const properties = convertNodeList(position, buffer, readString);
		return {
			end,
			properties,
			start,
			type: 'ObjectPattern'
		};
	},
	// AssignmentPatternProperty -> Property
	(position, buffer, readString): estree.Property & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const valuePosition = buffer[position++];
		const key = convertNode(position, buffer, readString);
		const value = valuePosition ? convertNode(valuePosition, buffer, readString) : key;
		return {
			computed: false,
			end,
			key,
			kind: 'init',
			method: false,
			shorthand: !valuePosition,
			start,
			type: 'Property',
			value
		};
	},
	// ImportExpression
	(position, buffer, readString): estree.ImportExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const source = convertNode(position, buffer, readString);
		return {
			end,
			source,
			start,
			type: 'ImportExpression'
		};
	},
	// FunctionDeclaration
	(
		position,
		buffer,
		readString
	): estree.FunctionDeclaration & AcornNode & { expression: false } => {
		const start = buffer[position++];
		const end = buffer[position++];
		const async = !!buffer[position++];
		const generator = !!buffer[position++];
		const idPosition = buffer[position++];
		const parameters = convertNodeList(buffer[position++], buffer, readString);
		const body = convertNode(position, buffer, readString);
		return {
			async,
			body,
			end,
			expression: false,
			generator,
			id: idPosition ? convertNode(idPosition, buffer, readString) : null,
			params: parameters,
			start,
			type: 'FunctionDeclaration'
		};
	},
	// ReturnStatement
	(position, buffer, readString): estree.ReturnStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const argumentPosition = buffer[position];
		return {
			argument: argumentPosition ? convertNode(argumentPosition, buffer, readString) : null,
			end,
			start,
			type: 'ReturnStatement'
		};
	},
	// ObjectLiteral -> ObjectExpression
	(position, buffer, readString): estree.ObjectExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const properties = convertNodeList(position, buffer, readString);
		return {
			end,
			properties,
			start,
			type: 'ObjectExpression'
		};
	},
	// KeyValueProperty -> Property
	(position, buffer, readString): estree.Property & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const keyPosition = buffer[position++];
		const value = convertNode(position, buffer, readString);
		return {
			computed: false,
			end,
			key: convertNode(keyPosition, buffer, readString),
			kind: 'init',
			method: false,
			shorthand: false,
			start,
			type: 'Property',
			value
		};
	},
	// ShorthandProperty -> Property
	(position, buffer, readString): estree.Property & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const key = convertNode(position, buffer, readString);
		const value = key;
		return {
			computed: false,
			end,
			key,
			kind: 'init',
			method: false,
			shorthand: true,
			start,
			type: 'Property',
			value
		};
	},
	// GetterProperty -> Property
	(position, buffer, readString): estree.Property & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const value = convertNode(buffer[position++], buffer, readString);
		const key = convertNode(position, buffer, readString);
		return {
			computed: false,
			end,
			key,
			kind: 'get',
			method: false,
			shorthand: false,
			start,
			type: 'Property',
			value
		};
	},
	// NewExpression
	(position, buffer, readString): estree.NewExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const argumentsPosition = buffer[position++];
		const callee = convertNode(position, buffer, readString);
		return {
			arguments: argumentsPosition ? convertNodeList(argumentsPosition, buffer, readString) : [],
			callee,
			end,
			start,
			type: 'NewExpression'
		};
	},
	// FunctionExpression
	(
		position,
		buffer,
		readString
	): estree.FunctionExpression &
		AcornNode & {
			expression: false;
		} => {
		const start = buffer[position++];
		const end = buffer[position++];
		const async = !!buffer[position++];
		const generator = !!buffer[position++];
		const idPosition = buffer[position++];
		const parameters = convertNodeList(buffer[position++], buffer, readString);
		const body = convertNode(position, buffer, readString);
		return {
			async,
			body,
			end,
			expression: false,
			generator,
			id: idPosition ? convertNode(idPosition, buffer, readString) : null,
			params: parameters,
			start,
			type: 'FunctionExpression'
		};
	},
	// ThrowStatement
	(position, buffer, readString): estree.ThrowStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const argument = convertNode(position, buffer, readString);
		return {
			argument,
			end,
			start,
			type: 'ThrowStatement'
		};
	},
	// LabeledStatement
	(position, buffer, readString): estree.LabeledStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const body = convertNode(buffer[position++], buffer, readString);
		const label = convertNode(position, buffer, readString);
		return {
			body,
			end,
			label,
			start,
			type: 'LabeledStatement'
		};
	},
	// TryStatement
	(position, buffer, readString): estree.TryStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const handlerPosition = buffer[position++];
		const finalizerPosition = buffer[position++];
		const block = convertNode(position, buffer, readString);
		return {
			block,
			end,
			finalizer: finalizerPosition ? convertNode(finalizerPosition, buffer, readString) : null,
			handler: handlerPosition ? convertNode(handlerPosition, buffer, readString) : null,
			start,
			type: 'TryStatement'
		};
	},
	// WhileStatement
	(position, buffer, readString): estree.WhileStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const test = convertNode(buffer[position++], buffer, readString);
		const body = convertNode(position, buffer, readString);
		return {
			body,
			end,
			start,
			test,
			type: 'WhileStatement'
		};
	}
];

const DECLARATION_KINDS: ('var' | 'let' | 'const')[] = ['var', 'let', 'const'];

const convertNodeList = (position: number, buffer: Uint32Array, readString: ReadString): any[] => {
	const length = buffer[position++];
	const list: any[] = [];
	for (let index = 0; index < length; index++) {
		const nodePosition = buffer[position++];
		list.push(nodePosition ? convertNode(nodePosition, buffer, readString) : null);
	}
	return list;
};

const convertString = (position: number, buffer: Uint32Array, readString: ReadString): string => {
	const length = buffer[position++];
	const bytePosition = position << 2;
	return readString(bytePosition, length);
};
