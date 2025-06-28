import type ArrowFunctionExpression from '../nodes/ArrowFunctionExpression';
import type FunctionExpression from '../nodes/FunctionExpression';
import * as NodeType from '../nodes/NodeType';
import type ObjectExpression from '../nodes/ObjectExpression';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import { NodeBase } from '../nodes/shared/Node';

export function isObjectExpressionNode(node: ExpressionEntity): node is ObjectExpression {
	return node instanceof NodeBase && node.type === NodeType.ObjectExpression;
}

export function isArrowFunctionExpressionNode(node: unknown): node is ArrowFunctionExpression {
	return node instanceof NodeBase && node.type === NodeType.ArrowFunctionExpression;
}

export function isFunctionExpressionNode(node: unknown): node is FunctionExpression {
	return node instanceof NodeBase && node.type === NodeType.FunctionExpression;
}
