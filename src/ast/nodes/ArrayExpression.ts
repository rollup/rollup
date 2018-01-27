import SpreadElement from './SpreadElement';
import { isUnknownKey, ObjectPath } from '../variables/VariableReassignmentTracker';
import { SomeReturnExpressionCallback } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';
import { NodeType } from './NodeType';
import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { pureArrayMembers } from '../values';

export default class ArrayExpression extends NodeBase {
	type: NodeType.ArrayExpression;
	elements: (ExpressionNode | SpreadElement | null)[];

	hasEffectsWhenAccessedAtPath (path: ObjectPath) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath (path: ObjectPath): boolean {
		if (path.length === 1) {
			const subPath = path[0];
			return isUnknownKey(subPath) || !pureArrayMembers[subPath];
		}
		return true;
	}

	someReturnExpressionWhenCalledAtPath (
		path: ObjectPath,
		_callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		if (path.length === 1) {
			const subPath = path[0];
			return isUnknownKey(subPath)
				|| !pureArrayMembers[subPath]
				|| predicateFunction(options)(pureArrayMembers[subPath].returnExpression);
		}
		return true;
	}
}
