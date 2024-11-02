import type FunctionExpression from '../nodes/FunctionExpression';
import * as nodeType from '../nodes/NodeType';
import type ObjectExpression from '../nodes/ObjectExpression';
import type Property from '../nodes/Property';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import type { ExpressionNode } from '../nodes/shared/Node';
import { NodeBase } from '../nodes/shared/Node';
import type ParameterVariable from '../variables/ParameterVariable';
import Variable from '../variables/Variable';

export function isParameterVariableNode(node: ExpressionEntity): node is ParameterVariable {
	return node instanceof Variable && node.kind === 'parameter';
}

export function isObjectExpressionNode(node: ExpressionEntity): node is ObjectExpression {
	return node instanceof NodeBase && node.type === nodeType.ObjectExpression;
}

export function isPropertyNode(node: ExpressionNode): node is Property {
	return node.type === nodeType.Property;
}

export function isFunctionExpressionNode(node: ExpressionNode): node is FunctionExpression {
	return node.type === nodeType.FunctionExpression;
}
