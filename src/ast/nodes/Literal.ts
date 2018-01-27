import ExecutionPathOptions from '../ExecutionPathOptions';
import MagicString from 'magic-string';
import { isUnknownKey, ObjectPath } from '../variables/VariableReassignmentTracker';
import { ExpressionEntity, SomeReturnExpressionCallback } from './shared/Expression';
import { Node, NodeBase } from './shared/Node';
import { NodeType } from './NodeType';
import CallOptions from '../CallOptions';
import { RenderOptions } from '../../Module';
import { getPureLiteralMembersForValue } from '../values';

export type LiteralValueTypes = string | boolean | null | number | RegExp;

export function isLiteral (node: Node): node is Literal {
	return node.type === NodeType.Literal;
}

export default class Literal<T = LiteralValueTypes> extends NodeBase {
	type: NodeType.Literal;
	value: T;

	private members: { [key: string]: { returnExpression: ExpressionEntity } };

	getValue () {
		return this.value;
	}

	hasEffectsWhenAccessedAtPath (path: ObjectPath, _options: ExecutionPathOptions) {
		if (this.value === null) {
			return path.length > 0;
		}
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 0;
	}

	hasEffectsWhenCalledAtPath (path: ObjectPath) {
		if (path.length === 1) {
			const subPath = path[0];
			return isUnknownKey(subPath) || !this.members[subPath];
		}
		return true;
	}

	initialiseNode () {
		this.members = getPureLiteralMembersForValue(this.value);
	}

	render (code: MagicString, _options: RenderOptions) {
		if (typeof this.value === 'string') {
			(<any> code).indentExclusionRanges.push([this.start + 1, this.end - 1]); // TODO TypeScript: Awaiting MagicString PR
		}
	}

	someReturnExpressionWhenCalledAtPath (
		path: ObjectPath,
		_callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		if (path.length === 1) {
			const subPath = path[0];
			return isUnknownKey(subPath)
				|| !this.members[subPath]
				|| predicateFunction(options)(this.members[subPath].returnExpression);
		}
		return true;
	}
}
