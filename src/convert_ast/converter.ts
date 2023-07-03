import type * as estree from 'estree';
import type { AcornNode } from '../rollup/types';

const nodeConverters: ((buffer: Uint32Array, position: number) => any)[] = [
	// Program
	(buffer, position): estree.Program & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const bodyLength = buffer[position++];
		const body: estree.Statement[] = [];
		for (let bodyIndex = 0; bodyIndex < bodyLength; bodyIndex++) {
			body.push(convertNode(buffer, buffer[position++]));
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
	(buffer, position): estree.ExpressionStatement & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const expression = convertNode(buffer, buffer[position]);
		return {
			end,
			expression,
			start,
			type: 'ExpressionStatement'
		};
	},
	// Literal<Number>
	(buffer, position): estree.Literal & AcornNode => {
		const start = buffer[position++];
		const end = buffer[position++];
		const value = new DataView(buffer.buffer).getFloat64(position << 2, true);
		return {
			end,
			start,
			type: 'Literal',
			value
		};
	}
];

const convertNode = (buffer: Uint32Array, position: number): any => {
	const nodeType = buffer[position];
	const converter = nodeConverters[nodeType];
	if (!converter) {
		throw new Error(`Unknown node type: ${nodeType}`);
	}
	return converter(buffer, position + 1);
};

export const convertProgram = (buffer: ArrayBuffer): any => convertNode(new Uint32Array(buffer), 0);
