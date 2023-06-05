import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { errorCannotCallNamespace, errorEval } from '../../utils/error';
import { renderCallArguments } from '../../utils/renderCallArguments';
import { type NodeRenderOptions, type RenderOptions } from '../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { INTERACTION_CALLED } from '../NodeInteractions';
import { EMPTY_PATH, type PathTracker, SHARED_RECURSION_TRACKER } from '../utils/PathTracker';
import Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import type * as NodeType from './NodeType';
import type SpreadElement from './SpreadElement';
import type Super from './Super';
import CallExpressionBase from './shared/CallExpressionBase';
import { type ExpressionEntity, UNKNOWN_RETURN_EXPRESSION } from './shared/Expression';
import type { ChainElement, ExpressionNode, IncludeChildren } from './shared/Node';
import { INCLUDE_PARAMETERS } from './shared/Node';

export default class CallExpression
	extends CallExpressionBase
	implements DeoptimizableEntity, ChainElement
{
	declare arguments: (ExpressionNode | SpreadElement)[];
	declare callee: ExpressionNode | Super;
	declare optional: boolean;
	declare type: NodeType.tCallExpression;

	bind(): void {
		super.bind();
		if (this.callee instanceof Identifier) {
			const variable = this.scope.findVariable(this.callee.name);

			if (variable.isNamespace) {
				this.context.warn(errorCannotCallNamespace(this.callee.name), this.start);
			}

			if (this.callee.name === 'eval') {
				this.context.warn(errorEval(this.context.module.id), this.start);
			}
		}
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

	hasEffects(context: HasEffectsContext): boolean {
		try {
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
		} finally {
			if (!this.deoptimized) this.applyDeoptimizations();
		}
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (includeChildrenRecursively) {
			super.include(context, includeChildrenRecursively);
			if (
				includeChildrenRecursively === INCLUDE_PARAMETERS &&
				this.callee instanceof Identifier &&
				this.callee.variable
			) {
				this.callee.variable.markCalledFromTryStatement();
			}
		} else {
			this.included = true;
			this.callee.include(context, false);
		}
		this.callee.includeCallArguments(context, this.arguments);
	}

	isSkippedAsOptional(origin: DeoptimizableEntity): boolean {
		return (
			(this.callee as ExpressionNode).isSkippedAsOptional?.(origin) ||
			(this.optional &&
				this.callee.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, origin) == null)
		);
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
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		this.callee.deoptimizeArgumentsOnInteractionAtPath(
			this.interaction,
			EMPTY_PATH,
			SHARED_RECURSION_TRACKER
		);
		this.context.requestTreeshakingPass();
	}

	protected getReturnExpression(
		recursionTracker: PathTracker = SHARED_RECURSION_TRACKER
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
