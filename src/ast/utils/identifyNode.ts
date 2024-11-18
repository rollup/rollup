import * as nodeType from '../nodes/NodeType';
import type ObjectExpression from '../nodes/ObjectExpression';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import { NodeBase } from '../nodes/shared/Node';

export function isObjectExpressionNode(node: ExpressionEntity): node is ObjectExpression {
	return node instanceof NodeBase && node.type === nodeType.ObjectExpression;
}
