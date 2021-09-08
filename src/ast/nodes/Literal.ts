import MagicString from 'magic-string';
import { CallOptions } from '../CallOptions';
import { HasEffectsContext } from '../ExecutionContext';
import { ObjectPath } from '../utils/PathTracker';
import {
	getLiteralMembersForValue,
	getMemberReturnExpressionWhenCalled,
	hasMemberEffectWhenCalled,
	MemberDescription
} from '../values';
import * as NodeType from './NodeType';
import {
	ExpressionEntity,
	LiteralValueOrUnknown,
	UNKNOWN_EXPRESSION,
	UnknownValue
} from './shared/Expression';
import { GenericEsTreeNode, NodeBase } from './shared/Node';

export type LiteralValue = string | boolean | null | number | RegExp | undefined;

export default class Literal<T extends LiteralValue = LiteralValue> extends NodeBase {
	declare regex?: {
		flags: string;
		pattern: string;
	};
	declare type: NodeType.tLiteral;
	declare value: T;

	private declare members: { [key: string]: MemberDescription };

	deoptimizeThisOnEventAtPath(): void {}

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
		return this.value;
	}

	getReturnExpressionWhenCalledAtPath(path: ObjectPath): ExpressionEntity {
		if (path.length !== 1) return UNKNOWN_EXPRESSION;
		return getMemberReturnExpressionWhenCalled(this.members, path[0]);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
		if (this.value === null) {
			return path.length > 0;
		}
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath): boolean {
		return path.length > 0;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		if (path.length === 1) {
			return hasMemberEffectWhenCalled(this.members, path[0], callOptions, context);
		}
		return true;
	}

	initialise(): void {
		this.members = getLiteralMembersForValue(this.value);
	}

	parseNode(esTreeNode: GenericEsTreeNode): void {
		this.value = esTreeNode.value;
		this.regex = esTreeNode.regex;
		super.parseNode(esTreeNode);
	}

	render(code: MagicString): void {
		if (typeof this.value === 'string') {
			(code.indentExclusionRanges as [number, number][]).push([this.start + 1, this.end - 1]);
		}
	}
}
