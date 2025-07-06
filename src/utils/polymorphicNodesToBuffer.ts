import type { ast } from '../rollup/types';
import type { NodeSerializer } from './nonCanonicalNodesToBuffer';
import {
	serializeDirective,
	serializeExpressionStatement as serializeExpressionStatementNode,
	serializeLiteralBigInt,
	serializeLiteralBoolean,
	serializeLiteralNull,
	serializeLiteralNumber,
	serializeLiteralRegExp,
	serializeLiteralString
} from './nonCanonicalNodesToBuffer';

export const serializeExpressionStatement: NodeSerializer<
	ast.ExpressionStatement | ast.Directive
> = (node, buffer) => {
	return 'directive' in node
		? serializeDirective(node, buffer)
		: serializeExpressionStatementNode(node, buffer);
};

export const serializeLiteral: NodeSerializer<ast.Literal> = (node, buffer) => {
	switch (typeof node.value) {
		case 'object':
			if (node.value === null) {
				return serializeLiteralNull(node, buffer);
			}
			return serializeLiteralRegExp(node as ast.LiteralRegExp, buffer);
		case 'boolean':
			return serializeLiteralBoolean(node as ast.LiteralBoolean, buffer);
		case 'number':
			return serializeLiteralNumber(node as ast.LiteralNumber, buffer);
		case 'string':
			return serializeLiteralString(node as ast.LiteralString, buffer);
		case 'bigint':
			return serializeLiteralBigInt(node as ast.LiteralBigInt, buffer);
		default: {
			/* istanbul ignore next */
			throw new Error(`Unexpected node value type for Literal: ${typeof node.value}`);
		}
	}
};
