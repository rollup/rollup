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
	// ExportDeclaration -> ExportNamedDeclaration
	(position, buffer, readString): estree.ExportNamedDeclaration & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const declaration = convertNode(position, buffer, readString);
		return {
			declaration,
			end,
			source: null,
			specifiers: [],
			start,
			type: 'ExportNamedDeclaration'
		};
	},
	// NamedExport -> ExportNamedDeclaration
	(position, buffer, readString): estree.ExportNamedDeclaration & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const sourcePosition = buffer[position++];
		const source = sourcePosition ? convertNode(sourcePosition, buffer, readString) : null;
		const specifiers = convertNodeList(position, buffer, readString);
		return {
			declaration: null,
			end,
			source,
			specifiers,
			start,
			type: 'ExportNamedDeclaration'
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
		const init = init_position ? convertNode(init_position, buffer, readString) : null;
		const id = convertNode(position, buffer, readString);
		return {
			end,
			id,
			init,
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
	// ExportNamedSpecifier -> ExportSpecifier
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
	// CallExpression
	(position, buffer, readString): estree.CallExpression & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const callee = convertNode(buffer[position++], buffer, readString);
		const argumentsList = convertNodeList(position, buffer, readString);
		return {
			arguments: argumentsList,
			callee,
			end,
			optional: false,
			start,
			type: 'CallExpression'
		};
	},
	// ArrowExpression -> ArrowFunctionExpression
	(position, buffer, readString): estree.ArrowFunctionExpression & AcornNode & { id: null } => {
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
		const object = convertNode(buffer[position++], buffer, readString);
		const computed = !!buffer[position++];
		const property = convertNode(position, buffer, readString);
		return {
			computed,
			end,
			object,
			optional: false,
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
	// ExportDefaultExpression -> ExportDefaultDeclaration
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
	// ExportAll -> ExportAllDeclaration
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
	}
];

const DECLARATION_KINDS: ('var' | 'let' | 'const')[] = ['var', 'let', 'const'];

const convertNodeList = (position: number, buffer: Uint32Array, readString: ReadString): any[] => {
	const length = buffer[position++];
	const list: any[] = [];
	for (let index = 0; index < length; index++) {
		list.push(convertNode(buffer[position++], buffer, readString));
	}
	return list;
};

const convertString = (position: number, buffer: Uint32Array, readString: ReadString): string => {
	const length = buffer[position++];
	const bytePosition = position << 2;
	return readString(bytePosition, length);
};
