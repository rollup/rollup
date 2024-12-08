import type MagicString from 'magic-string';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import {
	INTERACTION_ACCESSED,
	INTERACTION_ASSIGNED,
	INTERACTION_CALLED
} from '../NodeInteractions';
import type { ObjectPath } from '../utils/PathTracker';
import {
	getLiteralMembersForValue,
	getMemberReturnExpressionWhenCalled,
	hasMemberEffectWhenCalled,
	type MemberDescription
} from '../values';
import type * as NodeType from './NodeType';
import {
	type ExpressionEntity,
	type LiteralValueOrUnknown,
	UNKNOWN_RETURN_EXPRESSION,
	UnknownValue
} from './shared/Expression';
import { type GenericEsTreeNode, NodeBase, onlyIncludeSelf } from './shared/Node';

export type LiteralValue = string | boolean | null | number | RegExp | undefined;
export type LiteralValueOrBigInt = LiteralValue | bigint;

export default class Literal<
	T extends LiteralValueOrBigInt = LiteralValueOrBigInt
> extends NodeBase {
	declare bigint?: string;
	declare raw?: string;
	declare regex?: {
		flags: string;
		pattern: string;
	};
	declare type: NodeType.tLiteral;
	declare value: T;

	declare private members: Record<string, MemberDescription>;

	deoptimizeArgumentsOnInteractionAtPath(): void {}

	getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
		if (
			path.length > 0 ||
			// unknown literals can also be null but do not start with an "n"
			(this.value === null && this.scope.context.code.charCodeAt(this.start) !== 110) ||
			typeof this.value === 'bigint' ||
			// to support shims for regular expressions
			this.scope.context.code.charCodeAt(this.start) === 47
		) {
			return UnknownValue;
		}
		return this.value;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath
	): [expression: ExpressionEntity, isPure: boolean] {
		if (path.length !== 1) return UNKNOWN_RETURN_EXPRESSION;
		return getMemberReturnExpressionWhenCalled(this.members, path[0]);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		switch (interaction.type) {
			case INTERACTION_ACCESSED: {
				return path.length > (this.value === null ? 0 : 1);
			}
			case INTERACTION_ASSIGNED: {
				return true;
			}
			case INTERACTION_CALLED: {
				if (
					this.included &&
					this.value instanceof RegExp &&
					(this.value.global || this.value.sticky)
				) {
					return true;
				}
				return (
					path.length !== 1 ||
					hasMemberEffectWhenCalled(this.members, path[0], interaction, context)
				);
			}
		}
	}

	initialise(): void {
		super.initialise();
		this.members = getLiteralMembersForValue(this.value);
	}

	parseNode(esTreeNode: GenericEsTreeNode): this {
		this.value = esTreeNode.value;
		this.regex = esTreeNode.regex;
		return super.parseNode(esTreeNode);
	}

	render(code: MagicString): void {
		if (typeof this.value === 'string') {
			(code.indentExclusionRanges as [number, number][]).push([this.start + 1, this.end - 1]);
		}
	}
}

Literal.prototype.includeNode = onlyIncludeSelf;
