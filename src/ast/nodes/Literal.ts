import MagicString from 'magic-string';
import { CallOptions } from '../CallOptions';
import { HasEffectsContext } from '../ExecutionContext';
import { ObjectPath } from '../utils/PathTracker';
import {
	getLiteralMembersForValue,
	getMemberReturnExpressionWhenCalled,
	hasMemberEffectWhenCalled,
	LiteralValueOrUnknown,
	MemberDescription,
	UNKNOWN_EXPRESSION,
	UnknownValue
} from '../values';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export type LiteralValue = string | boolean | null | number | RegExp | undefined;

export default class Literal<T = LiteralValue> extends NodeBase {
	type!: NodeType.tLiteral;
	value!: T;

	private members!: { [key: string]: MemberDescription };

	getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
		if (
			path.length > 0 ||
			// unknown literals can also be null but do not start with an "n"
			(this.value === null && this.context.code.charCodeAt(this.start) !== 110) ||
			typeof this.value === 'bigint' ||
			// to support shims for regular expressions
			this.context.code.charCodeAt(this.start) === 47
		) {
			return UnknownValue;
		}
		return this.value as any;
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
		context: HasEffectsContext
	): boolean {
		if (path.length === 1) {
			return hasMemberEffectWhenCalled(this.members, path[0], this.included, callOptions, context);
		}
		return true;
	}

	initialise() {
		this.members = getLiteralMembersForValue(this.value);
	}

	render(code: MagicString) {
		if (typeof this.value === 'string') {
			(code.indentExclusionRanges as [number, number][]).push([this.start + 1, this.end - 1]);
		}
	}
}
