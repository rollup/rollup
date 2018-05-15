import { ObjectPath, LiteralValueOrUnknown, UNKNOWN_VALUE, EMPTY_PATH } from '../values';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import { LiteralValue } from './Literal';

const binaryOperators: {
	[operator: string]: (left: LiteralValue, right: LiteralValue) => LiteralValueOrUnknown;
} = {
	'==': (left, right) => left == right,
	'!=': (left, right) => left != right,
	'===': (left, right) => left === right,
	'!==': (left, right) => left !== right,
	'<': (left, right) => left < right,
	'<=': (left, right) => left <= right,
	'>': (left, right) => left > right,
	'>=': (left, right) => left >= right,
	'<<': (left: any, right: any) => left << right,
	'>>': (left: any, right: any) => left >> right,
	'>>>': (left: any, right: any) => left >>> right,
	'+': (left: any, right: any) => left + right,
	'-': (left: any, right: any) => left - right,
	'*': (left: any, right: any) => left * right,
	'/': (left: any, right: any) => left / right,
	'%': (left: any, right: any) => left % right,
	'|': (left: any, right: any) => left | right,
	'^': (left: any, right: any) => left ^ right,
	'&': (left: any, right: any) => left & right,
	'**': (left: any, right: any) => Math.pow(left, right),
	in: (left, right: any) => left in right,
	instanceof: (left, right: any) => left instanceof right
};

export default class BinaryExpression extends NodeBase {
	type: NodeType.tBinaryExpression;
	left: ExpressionNode;
	right: ExpressionNode;
	operator: keyof typeof binaryOperators;

	getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
		if (path.length > 0) return UNKNOWN_VALUE;
		const leftValue = this.left.getLiteralValueAtPath(EMPTY_PATH);
		if (leftValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;

		const rightValue = this.right.getLiteralValueAtPath(EMPTY_PATH);
		if (rightValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;

		const operatorFn = binaryOperators[this.operator];
		if (!operatorFn) return UNKNOWN_VALUE;

		return operatorFn(<LiteralValue>leftValue, <LiteralValue>rightValue);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 1;
	}
}
