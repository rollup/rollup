import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { WritableEntity } from '../../Entity';
import type { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import type { EntityPathTracker, ObjectPath, SymbolToStringTag } from '../../utils/PathTracker';
import { UNKNOWN_PATH } from '../../utils/PathTracker';
import type { LiteralValue } from '../Literal';
import { Flag, isFlagSet, setFlag } from './BitFlags';
import type { IncludeChildren } from './Node';

export const UnknownValue = Symbol('Unknown Value');
export const UnknownTruthyValue = Symbol('Unknown Truthy Value');
export const UnknownFalsyValue = Symbol('Unknown Falsy Value');

export type LiteralValueOrUnknown =
	| LiteralValue
	| typeof UnknownValue
	| typeof UnknownTruthyValue
	| typeof UnknownFalsyValue
	| typeof SymbolToStringTag;

export interface InclusionOptions {
	/**
	 * Include the id of a declarator even if unused to ensure it is a valid
	 * statement.
	 */
	asSingleStatement?: boolean;
}

export class ExpressionEntity implements WritableEntity {
	protected flags = 0;

	get included(): boolean {
		return isFlagSet(this.flags, Flag.included);
	}
	set included(value: boolean) {
		this.flags = setFlag(this.flags, Flag.included, value);
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		_path: ObjectPath,
		_recursionTracker: EntityPathTracker
	): void {
		deoptimizeInteraction(interaction);
	}

	deoptimizePath(_path: ObjectPath): void {}

	/**
	 * If possible it returns a stringifyable literal value for this node that
	 * can be used for inlining or comparing values. Otherwise, it should return
	 * UnknownValue.
	 */
	getLiteralValueAtPath(
		_path: ObjectPath,
		_recursionTracker: EntityPathTracker,
		_origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return UnknownValue;
	}

	getReturnExpressionWhenCalledAtPath(
		_path: ObjectPath,
		_interaction: NodeInteractionCalled,
		_recursionTracker: EntityPathTracker,
		_origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		return UNKNOWN_RETURN_EXPRESSION;
	}

	hasEffectsOnInteractionAtPath(
		_path: ObjectPath,
		_interaction: NodeInteraction,
		_context: HasEffectsContext
	): boolean {
		return true;
	}

	include(
		context: InclusionContext,
		_includeChildrenRecursively: IncludeChildren,
		_options?: InclusionOptions
	): void {
		if (!this.included) this.includeNode(context);
	}

	includeNode(_context: InclusionContext): void {
		this.included = true;
	}

	includePath(_path: ObjectPath, context: InclusionContext): void {
		if (!this.included) this.includeNode(context);
	}
	/* We are both including and including an unknown path here as the former
	 * ensures that nested nodes are included while the latter ensures that all
	 * paths of the expression are included.
	 * */

	includeCallArguments(interaction: NodeInteractionCalled, context: InclusionContext): void {
		includeInteraction(interaction, context);
	}

	shouldBeIncluded(_context: InclusionContext): boolean {
		return true;
	}
}

export const UNKNOWN_EXPRESSION: ExpressionEntity =
	new (class UnknownExpression extends ExpressionEntity {})();

export const UNKNOWN_RETURN_EXPRESSION: [expression: ExpressionEntity, isPure: boolean] = [
	UNKNOWN_EXPRESSION,
	false
];

export const deoptimizeInteraction = (interaction: NodeInteraction) => {
	for (const argument of interaction.args) {
		argument?.deoptimizePath(UNKNOWN_PATH);
	}
};

export const includeInteraction = ({ args }: NodeInteraction, context: InclusionContext) => {
	// We do not re-include the "this" argument as we expect this is already
	// re-included at the call site
	args[0]?.includePath(UNKNOWN_PATH, context);
	for (let argumentIndex = 1; argumentIndex < args.length; argumentIndex++) {
		const argument = args[argumentIndex];
		if (argument) {
			argument.includePath(UNKNOWN_PATH, context);
			argument.include(context, false);
		}
	}
};
