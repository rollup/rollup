import MagicString from 'magic-string';
import { NormalizedTreeshakingOptions } from '../../rollup/types';
import { BLANK } from '../../utils/blank';
import {
	findFirstOccurrenceOutsideComment,
	NodeRenderOptions,
	RenderOptions
} from '../../utils/renderHelpers';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { EVENT_CALLED, NodeEvent } from '../NodeEvents';
import {
	EMPTY_PATH,
	ObjectPath,
	PathTracker,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH
} from '../utils/PathTracker';
import Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import * as NodeType from './NodeType';
import SpreadElement from './SpreadElement';
import Super from './Super';
import {
	ExpressionEntity,
	LiteralValueOrUnknown,
	UNKNOWN_EXPRESSION,
	UnknownValue
} from './shared/Expression';
import { ExpressionNode, INCLUDE_PARAMETERS, IncludeChildren, NodeBase } from './shared/Node';

export default class CallExpression extends NodeBase implements DeoptimizableEntity {
	arguments!: (ExpressionNode | SpreadElement)[];
	callee!: ExpressionNode | Super;
	optional!: boolean;
	type!: NodeType.tCallExpression;
	protected deoptimized = false;
	private callOptions!: CallOptions;
	private deoptimizableDependentExpressions: DeoptimizableEntity[] = [];
	private expressionsToBeDeoptimized = new Set<ExpressionEntity>();
	private returnExpression: ExpressionEntity | null = null;

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

	deoptimizeCache(): void {
		if (this.returnExpression !== UNKNOWN_EXPRESSION) {
			this.returnExpression = UNKNOWN_EXPRESSION;
			for (const expression of this.deoptimizableDependentExpressions) {
				expression.deoptimizeCache();
			}
			for (const expression of this.expressionsToBeDeoptimized) {
				expression.deoptimizePath(UNKNOWN_PATH);
			}
		}
	}

	deoptimizePath(path: ObjectPath): void {
		if (
			path.length === 0 ||
			this.context.deoptimizationTracker.trackEntityAtPathAndGetIfTracked(path, this)
		) {
			return;
		}
		const returnExpression = this.getReturnExpression();
		if (returnExpression !== UNKNOWN_EXPRESSION) {
			returnExpression.deoptimizePath(path);
		}
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	): void {
		const returnExpression = this.getReturnExpression(recursionTracker);
		if (returnExpression === UNKNOWN_EXPRESSION) {
			thisParameter.deoptimizePath(UNKNOWN_PATH);
		} else {
			recursionTracker.withTrackedEntityAtPath(
				path,
				returnExpression,
				() => {
					this.expressionsToBeDeoptimized.add(thisParameter);
					returnExpression.deoptimizeThisOnEventAtPath(
						event,
						path,
						thisParameter,
						recursionTracker
					);
				},
				undefined
			);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		const returnExpression = this.getReturnExpression(recursionTracker);
		if (returnExpression === UNKNOWN_EXPRESSION) {
			return UnknownValue;
		}
		return recursionTracker.withTrackedEntityAtPath(
			path,
			returnExpression,
			() => {
				this.deoptimizableDependentExpressions.push(origin);
				return returnExpression.getLiteralValueAtPath(path, recursionTracker, origin);
			},
			UnknownValue
		);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		const returnExpression = this.getReturnExpression(recursionTracker);
		if (this.returnExpression === UNKNOWN_EXPRESSION) {
			return UNKNOWN_EXPRESSION;
		}
		return recursionTracker.withTrackedEntityAtPath(
			path,
			returnExpression,
			() => {
				this.deoptimizableDependentExpressions.push(origin);
				return returnExpression.getReturnExpressionWhenCalledAtPath(
					path,
					callOptions,
					recursionTracker,
					origin
				);
			},
			UNKNOWN_EXPRESSION
		);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
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
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return (
			!context.accessed.trackEntityAtPathAndGetIfTracked(path, this) &&
			this.getReturnExpression().hasEffectsWhenAccessedAtPath(path, context)
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return (
			!context.assigned.trackEntityAtPathAndGetIfTracked(path, this) &&
			this.getReturnExpression().hasEffectsWhenAssignedAtPath(path, context)
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		return (
			!(
				callOptions.withNew ? context.instantiated : context.called
			).trackEntityAtPathAndGetIfTracked(path, callOptions, this) &&
			this.getReturnExpression().hasEffectsWhenCalledAtPath(path, callOptions, context)
		);
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
		const returnExpression = this.getReturnExpression();
		if (!returnExpression.included) {
			returnExpression.include(context, false);
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, renderedSurroundingElement }: NodeRenderOptions = BLANK
	): void {
		const surroundingELement = renderedParentType || renderedSurroundingElement;
		this.callee.render(code, options, {
			isCalleeOfRenderedParent: true,
			renderedSurroundingElement: surroundingELement
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

	private getReturnExpression(
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
