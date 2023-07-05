import type * as estree from 'estree';
import type { AcornNode } from '../rollup/types';

type ReadString = (start: number, length: number) => string;

export const convertProgram = (buffer: ArrayBuffer, readString: ReadString): any =>
	convertNode(0, new Uint32Array(buffer), readString);

const convertNode = (position: number, buffer: Uint32Array, readString: ReadString): any => {
	const nodeType = buffer[position];
	const converter = nodeConverters[nodeType];
	if (!converter) {
		throw new Error(`Unknown node type: ${nodeType}`);
	}
	return converter(position + 1, buffer, readString);
};

const nodeConverters: ((position: number, buffer: Uint32Array, readString: ReadString) => any)[] = [
	// Module -> Program
	(position, buffer, readString): estree.Program & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const bodyLength = buffer[position++];
		const body: estree.Statement[] = [];
		for (let bodyIndex = 0; bodyIndex < bodyLength; bodyIndex++) {
			body.push(convertNode(buffer[position++], buffer, readString));
		}
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
		const expression = convertNode(buffer[position], buffer, readString);
		return {
			end,
			expression,
			start,
			type: 'ExpressionStatement'
		};
	},
	// Number -> Literal
	(position, buffer): estree.Literal & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const value = new DataView(buffer.buffer).getFloat64(position << 2, true);
		return {
			end,
			start,
			type: 'Literal',
			value
		};
	},
	// ExportDeclaration -> ExportNamedDeclaration
	(position, buffer, readString): estree.ExportNamedDeclaration & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const declaration = convertNode(buffer[position], buffer, readString);
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
		const specifiersLength = buffer[position++];
		const specifiers: estree.ExportSpecifier[] = [];
		for (let specifierIndex = 0; specifierIndex < specifiersLength; specifierIndex++) {
			specifiers.push(convertNode(buffer[position++], buffer, readString));
		}
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
		const id = convertNode(buffer[position++], buffer, readString);
		const init_position = buffer[position];
		const init = init_position ? convertNode(init_position, buffer, readString) : null;
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
		const value = convertString(position, buffer, readString);
		return {
			end,
			start,
			type: 'Literal',
			value
		};
	},
	// ExportNamedSpecifier -> ExportSpecifier
	(position, buffer, readString): estree.ExportSpecifier & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const exportPosition = buffer[position++];
		const exported = convertNode(exportPosition, buffer, readString);
		const local = convertNode(position, buffer, readString);
		return {
			end,
			exported,
			local,
			start,
			type: 'ExportSpecifier'
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
