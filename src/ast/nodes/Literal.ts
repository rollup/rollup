import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import {
	getLiteralMembersForValue,
	hasMemberEffectWhenCalled,
	LiteralValueOrUnknown,
	MemberDescription,
	ObjectPath,
	someMemberReturnExpressionWhenCalled,
	UNKNOWN_VALUE
} from '../values';
import * as NodeType from './NodeType';
import { SomeReturnExpressionCallback } from './shared/Expression';
import { Node, NodeBase } from './shared/Node';

export type LiteralValue = string | boolean | null | number | RegExp;

export function isLiteral(node: Node): node is Literal {
	return node.type === NodeType.Literal;
}

export default class Literal<T = LiteralValue> extends NodeBase {
	type: NodeType.tLiteral;
	value: T;

	private members: { [key: string]: MemberDescription };

	getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
		if (path.length > 0) {
			return UNKNOWN_VALUE;
		}
		// not sure why we need this type cast here
		return <any>this.value;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		if (this.value === null) {
			return path.length > 0;
		}
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath) {
		return path.length > 0;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		if (path.length === 1) {
			return hasMemberEffectWhenCalled(this.members, path[0], this.included, callOptions, options);
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
