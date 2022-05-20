import type MagicString from 'magic-string';
import type { NormalizedTreeshakingOptions } from '../../rollup/types';
import { BLANK } from '../../utils/blank';
import {
	findFirstOccurrenceOutsideComment,
	type NodeRenderOptions,
	type RenderOptions
} from '../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { EVENT_CALLED } from '../NodeEvents';
import {
	EMPTY_PATH,
	type PathTracker,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH
} from '../utils/PathTracker';
import Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import type * as NodeType from './NodeType';
import type SpreadElement from './SpreadElement';
import type Super from './Super';
import CallExpressionBase from './shared/CallExpressionBase';
import { type ExpressionEntity, UNKNOWN_EXPRESSION } from './shared/Expression';
import { type ExpressionNode, INCLUDE_PARAMETERS, type IncludeChildren } from './shared/Node';

export default class CallExpression extends CallExpressionBase implements DeoptimizableEntity {
	declare arguments: (ExpressionNode | SpreadElement)[];
	declare callee: ExpressionNode | Super;
	declare optional: boolean;
	declare type: NodeType.tCallExpression;

	bind(): void {
		super.bind();
		if (this.callee instanceof Identifier) {
			const variable = this.scope.findVariable(this.callee.name);

			if (variable.isNamespace) {
				this.context.warn(
					{
						code: 'CANNOT_CALL_NAMESPACE',
						message: `Cannot call a namespace ('${this.callee.name}')`
					},
					this.start
				);
			}

			if (this.callee.name === 'eval') {
				this.context.warn(
					{
						code: 'EVAL',
						message: `Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification`,
						url: 'https://rollupjs.org/guide/en/#avoiding-eval'
					},
					this.start
				);
			}
		}
		this.callOptions = {
			args: this.arguments,
			thisParam:
				this.callee instanceof MemberExpression && !this.callee.variable
					? this.callee.object
					: null,
			withNew: false
		};
	}

	hasEffects(context: HasEffectsContext): boolean {
		try {
			for (const argument of this.arguments) {
				if (argument.hasEffects(context)) return true;
			}
			if (
				(this.context.options.treeshake as NormalizedTreeshakingOptions).annotations &&
				this.annotations
			)
				return false;
			return (
				this.callee.hasEffects(context) ||
				this.callee.hasEffectsWhenCalledAtPath(EMPTY_PATH, this.callOptions, context)
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
		this.callee.includeArgumentsWhenCalledAtPath(EMPTY_PATH, context, this.arguments);
		const returnExpression = this.getReturnExpression();
		if (!returnExpression.included) {
			returnExpression.include(context, false);
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
		if (this.arguments.length > 0) {
			if (this.arguments[this.arguments.length - 1].included) {
				for (const arg of this.arguments) {
					arg.render(code, options);
				}
			} else {
				let lastIncludedIndex = this.arguments.length - 2;
				while (lastIncludedIndex >= 0 && !this.arguments[lastIncludedIndex].included) {
					lastIncludedIndex--;
				}
				if (lastIncludedIndex >= 0) {
					for (let index = 0; index <= lastIncludedIndex; index++) {
						this.arguments[index].render(code, options);
					}
					code.remove(
						findFirstOccurrenceOutsideComment(
							code.original,
							',',
							this.arguments[lastIncludedIndex].end
						),
						this.end - 1
					);
				} else {
					code.remove(
						findFirstOccurrenceOutsideComment(code.original, '(', this.callee.end) + 1,
						this.end - 1
					);
				}
			}
		}
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		const { thisParam } = this.callOptions;
		if (thisParam) {
			this.callee.deoptimizeThisOnEventAtPath(
				EVENT_CALLED,
				EMPTY_PATH,
				thisParam,
				SHARED_RECURSION_TRACKER
			);
		}
		for (const argument of this.arguments) {
			// This will make sure all properties of parameters behave as "unknown"
			argument.deoptimizePath(UNKNOWN_PATH);
		}
		this.context.requestTreeshakingPass();
	}

	protected getReturnExpression(
		recursionTracker: PathTracker = SHARED_RECURSION_TRACKER
	): ExpressionEntity {
		if (this.returnExpression === null) {
			this.returnExpression = UNKNOWN_EXPRESSION;
			return (this.returnExpression = this.callee.getReturnExpressionWhenCalledAtPath(
				EMPTY_PATH,
				this.callOptions,
				recursionTracker,
				this
			));
		}
		return this.returnExpression;
	}
}
