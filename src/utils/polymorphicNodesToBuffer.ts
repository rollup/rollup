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
> = (node, buffer, position) => {
	return 'directive' in node
		? serializeDirective(node, buffer, position)
		: serializeExpressionStatementNode(node, buffer, position);
};

export const serializeLiteral: NodeSerializer<ast.Literal> = (node, buffer, position) => {
	switch (typeof node.value) {
		case 'object':
			if (node.value === null) {
				return serializeLiteralNull(node, buffer, position);
			}
			return serializeLiteralRegExp(node as ast.LiteralRegExp, buffer, position);
		case 'boolean':
			return serializeLiteralBoolean(node as ast.LiteralBoolean, buffer, position);
		case 'number':
			return serializeLiteralNumber(node as ast.LiteralNumber, buffer, position);
		case 'string':
			return serializeLiteralString(node as ast.LiteralString, buffer, position);
		case 'bigint':
			return serializeLiteralBigInt(node as ast.LiteralBigInt, buffer, position);
		default: {
			/* istanbul ignore next */
			throw new Error(`Unexpected node value type for Literal: ${typeof node.value}`);
		}
	}
};
