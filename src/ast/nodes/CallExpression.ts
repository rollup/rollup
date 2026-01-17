import type MagicString from 'magic-string';
import type { NormalizedTreeshakingOptions } from '../../rollup/types';
import { BLANK } from '../../utils/blank';
import { LOGLEVEL_WARN } from '../../utils/logging';
import { logCannotCallNamespace, logEval } from '../../utils/logs';
import { renderCallArguments } from '../../utils/renderCallArguments';
import { type NodeRenderOptions, type RenderOptions } from '../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { INTERACTION_CALLED } from '../NodeInteractions';
import type { EntityPathTracker, ObjectPath } from '../utils/PathTracker';
import { EMPTY_PATH, SHARED_RECURSION_TRACKER } from '../utils/PathTracker';
import Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import type * as NodeType from './NodeType';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import CallExpressionBase from './shared/CallExpressionBase';
import { getChainElementLiteralValueAtPath } from './shared/chainElements';
import type { ExpressionEntity, LiteralValueOrUnknown } from './shared/Expression';
import { UNKNOWN_RETURN_EXPRESSION } from './shared/Expression';
import type { ChainElement, ExpressionNode, IncludeChildren, SkippedChain } from './shared/Node';
import { INCLUDE_PARAMETERS, IS_SKIPPED_CHAIN } from './shared/Node';
import type SpreadElement from './SpreadElement';
import type Super from './Super';

export default class CallExpression
	extends CallExpressionBase
	implements DeoptimizableEntity, ChainElement
{
	declare arguments: (ExpressionNode | SpreadElement)[];
	declare callee: ExpressionNode | Super;
	declare type: NodeType.tCallExpression;
	/** Marked with #__PURE__ annotation */
	declare annotationPure?: boolean;

	private get hasCheckedForWarnings(): boolean {
		return isFlagSet(this.flags, Flag.checkedForWarnings);
	}
	private set hasCheckedForWarnings(value: boolean) {
		this.flags = setFlag(this.flags, Flag.checkedForWarnings, value);
	}

	get optional(): boolean {
		return isFlagSet(this.flags, Flag.optional);
	}
	set optional(value: boolean) {
		this.flags = setFlag(this.flags, Flag.optional, value);
	}

	bind(): void {
		super.bind();
		this.interaction = {
			args: [
				this.callee instanceof MemberExpression && !this.callee.variable
					? this.callee.object
					: null,
				...this.arguments
			],
			type: INTERACTION_CALLED,
			withNew: false
		};
	}

	getLiteralValueAtPathAsChainElement(
		path: ObjectPath,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown | SkippedChain {
		return getChainElementLiteralValueAtPath(this, this.callee, path, recursionTracker, origin);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		for (const argument of this.arguments) {
			if (argument.hasEffects(context)) return true;
		}
		if (this.annotationPure) {
			return false;
		}
		return (
			this.callee.hasEffects(context) ||
			this.callee.hasEffectsOnInteractionAtPath(EMPTY_PATH, this.interaction, context)
		);
	}

	hasEffectsAsChainElement(context: HasEffectsContext): boolean | SkippedChain {
		const calleeHasEffects =
			'hasEffectsAsChainElement' in this.callee
				? (this.callee as ChainElement).hasEffectsAsChainElement(context)
				: this.callee.hasEffects(context);
		if (calleeHasEffects === IS_SKIPPED_CHAIN) return IS_SKIPPED_CHAIN;
		if (
			this.optional &&
			this.callee.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, this) == null
		) {
			return (!this.annotationPure && calleeHasEffects) || IS_SKIPPED_CHAIN;
		}
		// We only apply deoptimizations lazily once we know we are not skipping
		if (!this.deoptimized) this.applyDeoptimizations();
		for (const argument of this.arguments) {
			if (argument.hasEffects(context)) return true;
		}
		return (
			!this.annotationPure &&
			(calleeHasEffects ||
				this.callee.hasEffectsOnInteractionAtPath(EMPTY_PATH, this.interaction, context))
		);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.included) this.includeNode(context);
		if (includeChildrenRecursively) {
			super.include(context, true);
			if (
				includeChildrenRecursively === INCLUDE_PARAMETERS &&
				this.callee instanceof Identifier &&
				this.callee.variable
			) {
				this.callee.variable.markCalledFromTryStatement();
			}
		} else {
			this.callee.include(context, false);
			this.callee.includeCallArguments(this.interaction, context);
		}
	}

	includeNode(_context: InclusionContext) {
		this.included = true;
		if (!this.deoptimized) this.applyDeoptimizations();
	}

	initialise() {
		super.initialise();
		if (
			this.annotations &&
			(this.scope.context.options.treeshake as NormalizedTreeshakingOptions).annotations
		) {
			this.annotationPure = this.annotations.some(comment => comment.type === 'pure');
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedSurroundingElement }: NodeRenderOptions = BLANK
	): void {
		this.callee.render(code, options, {
			isCalleeOfRenderedParent: true,
			renderedSurroundingElement
		});
		renderCallArguments(code, options, this);

		if (this.callee instanceof Identifier && !this.hasCheckedForWarnings) {
			this.hasCheckedForWarnings = true;
			const variable = this.scope.findVariable(this.callee.name);
			if (variable.isNamespace) {
				this.scope.context.log(LOGLEVEL_WARN, logCannotCallNamespace(this.callee.name), this.start);
			}
			if (this.callee.name === 'eval') {
				this.scope.context.log(LOGLEVEL_WARN, logEval(this.scope.context.module.id), this.start);
			}
		}
	}

	applyDeoptimizations() {
		this.deoptimized = true;
		this.callee.deoptimizeArgumentsOnInteractionAtPath(
			this.interaction,
			EMPTY_PATH,
			SHARED_RECURSION_TRACKER
		);
		this.scope.context.requestTreeshakingPass();
	}

	protected getReturnExpression(
		recursionTracker: EntityPathTracker = SHARED_RECURSION_TRACKER
	): [expression: ExpressionEntity, isPure: boolean] {
		if (this.returnExpression === null) {
			this.returnExpression = UNKNOWN_RETURN_EXPRESSION;
			return (this.returnExpression = this.callee.getReturnExpressionWhenCalledAtPath(
				EMPTY_PATH,
				this.interaction,
				recursionTracker,
				this
			));
		}
		return this.returnExpression;
	}
}
