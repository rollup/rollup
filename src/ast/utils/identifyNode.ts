import type AwaitExpression from '../nodes/AwaitExpression';
import * as nodeType from '../nodes/NodeType';
import type ObjectExpression from '../nodes/ObjectExpression';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import { NodeBase } from '../nodes/shared/Node';

export function isObjectExpressionNode(node: ExpressionEntity): node is ObjectExpression {
	return node instanceof NodeBase && node.type === nodeType.ObjectExpression;
}

export function isAwaitExpressionNode(node: unknown): node is AwaitExpression {
	return node instanceof NodeBase && node.type === nodeType.AwaitExpression;
}
