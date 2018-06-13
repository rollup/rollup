import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import {
	getLiteralMembersForValue,
	getMemberReturnExpressionWhenCalled,
	hasMemberEffectWhenCalled,
	LiteralValueOrUnknown,
	MemberDescription,
	ObjectPath,
	UNKNOWN_EXPRESSION,
	UNKNOWN_VALUE
} from '../values';
import * as NodeType from './NodeType';
import { Node, NodeBase } from './shared/Node';

export type LiteralValue = string | boolean | null | number | RegExp | undefined;

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

	getReturnExpressionWhenCalledAtPath(path: ObjectPath) {
		if (path.length !== 1) return UNKNOWN_EXPRESSION;
		return getMemberReturnExpressionWhenCalled(this.members, path[0]);
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
}
