import ExecutionPathOptions from '../ExecutionPathOptions';
import MagicString from 'magic-string';
import { SomeReturnExpressionCallback } from './shared/Expression';
import { Node, NodeBase } from './shared/Node';
import { NodeType } from './NodeType';
import CallOptions from '../CallOptions';
import {
	getLiteralMembersForValue,
	hasMemberEffectWhenCalled,
	MemberDescription,
	ObjectPath,
	someMemberReturnExpressionWhenCalled
} from '../values';
import { RenderOptions } from '../../utils/renderHelpers';

export type LiteralValueTypes = string | boolean | null | number | RegExp;

export function isLiteral(node: Node): node is Literal {
	return node.type === NodeType.Literal;
}

export default class Literal<T = LiteralValueTypes> extends NodeBase {
	type: NodeType.Literal;
	value: T;

	private members: { [key: string]: MemberDescription };

	getValue() {
		return this.value;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		if (this.value === null) {
			return path.length > 0;
		}
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 0;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		if (path.length === 1) {
			return hasMemberEffectWhenCalled(this.members, path[0], callOptions, options);
		}
		return true;
	}

	initialise() {
		this.included = false;
		this.members = getLiteralMembersForValue(this.value);
	}

	render(code: MagicString, _options: RenderOptions) {
		if (typeof this.value === 'string') {
			(<[number, number][]>code.indentExclusionRanges).push([this.start + 1, this.end - 1]);
		}
	}

	someReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		if (path.length === 1) {
			return someMemberReturnExpressionWhenCalled(
				this.members,
				path[0],
				callOptions,
				predicateFunction,
				options
			);
		}
		return true;
	}
}
