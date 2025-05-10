import type ArrowFunctionExpression from '../nodes/ArrowFunctionExpression';
import type AwaitExpression from '../nodes/AwaitExpression';
import type CallExpression from '../nodes/CallExpression';
import type Identifier from '../nodes/Identifier';
import type ImportExpression from '../nodes/ImportExpression';
import type MemberExpression from '../nodes/MemberExpression';
import * as nodeType from '../nodes/NodeType';
import type ObjectExpression from '../nodes/ObjectExpression';
import type Property from '../nodes/Property';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import type { ExpressionNode } from '../nodes/shared/Node';
import { NodeBase } from '../nodes/shared/Node';
export function isObjectExpressionNode(node: ExpressionEntity): node is ObjectExpression {
	return node instanceof NodeBase && node.type === nodeType.ObjectExpression;
}

export function isPropertyNode(node: unknown): node is Property {
	return node instanceof NodeBase && node.type === nodeType.Property;
}

export function isArrowFunctionExpressionNode(node: unknown): node is ArrowFunctionExpression {
	return node instanceof NodeBase && node.type === nodeType.ArrowFunctionExpression;
}

export function isCallExpressionNode(node: unknown): node is CallExpression {
	return node instanceof NodeBase && node.type === nodeType.CallExpression;
}

export function isMemberExpressionNode(node: ExpressionNode): node is MemberExpression {
	return node instanceof NodeBase && node.type === nodeType.MemberExpression;
}

export function isImportExpressionNode(node: unknown): node is ImportExpression {
	return node instanceof NodeBase && node.type === nodeType.ImportExpression;
}

export function isAwaitExpressionNode(node: unknown): node is AwaitExpression {
	return node instanceof NodeBase && node.type === nodeType.AwaitExpression;
}

export function isIdentifierNode(node: unknown): node is Identifier {
	return node instanceof NodeBase && node.type === nodeType.Identifier;
}
