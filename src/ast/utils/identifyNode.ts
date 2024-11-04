import * as nodeType from '../nodes/NodeType';
import type ObjectExpression from '../nodes/ObjectExpression';
import type Property from '../nodes/Property';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import type { ExpressionNode } from '../nodes/shared/Node';
import { NodeBase } from '../nodes/shared/Node';

export function isObjectExpressionNode(node: ExpressionEntity): node is ObjectExpression {
	return node instanceof NodeBase && node.type === nodeType.ObjectExpression;
}

export function isPropertyNode(node: ExpressionNode): node is Property {
	return node.type === nodeType.Property;
}
