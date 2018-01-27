import SpreadElement from './SpreadElement';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { SomeReturnExpressionCallback } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';
import { NodeType } from './NodeType';
import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { hasMemberEffectWhenCalled, arrayMembers, someMemberReturnExpressionWhenCalled } from '../values';

export default class ArrayExpression extends NodeBase {
	type: NodeType.ArrayExpression;
	elements: (ExpressionNode | SpreadElement | null)[];

	hasEffectsWhenAccessedAtPath (path: ObjectPath) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath (path: ObjectPath, callOptions: CallOptions, options: ExecutionPathOptions): boolean {
		if (path.length === 1) {
			return hasMemberEffectWhenCalled(arrayMembers, path[0], callOptions, options);
		}
		return true;
	}

	someReturnExpressionWhenCalledAtPath (
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		if (path.length === 1) {
			return someMemberReturnExpressionWhenCalled(arrayMembers, path[0], callOptions, predicateFunction, options);
		}
		return true;
	}
}
