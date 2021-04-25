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
import { LiteralValueOrUnknown, UnknownValue, UNKNOWN_EXPRESSION } from '../unknownValues';
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
import { ExpressionEntity } from './shared/Expression';
import {
	Annotation,
	ExpressionNode,
	IncludeChildren,
	INCLUDE_PARAMETERS,
	NodeBase
} from './shared/Node';
import SpreadElement from './SpreadElement';
import Super from './Super';

export default class CallExpression extends NodeBase implements DeoptimizableEntity {
	arguments!: (ExpressionNode | SpreadElement)[];
	callee!: ExpressionNode | Super;
	optional!: boolean;
	type!: NodeType.tCallExpression;

	private callOptions!: CallOptions;
	private deoptimized = false;
	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];
	private returnExpression: ExpressionEntity | null = null;
	private wasPathDeoptmizedWhileOptimized = false;

	bind() {
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
	}

	deoptimizeCache() {
		if (this.returnExpression !== UNKNOWN_EXPRESSION) {
			this.returnExpression = null;
			const returnExpression = this.getReturnExpression();
			const expressionsToBeDeoptimized = this.expressionsToBeDeoptimized;
			if (returnExpression !== UNKNOWN_EXPRESSION) {
				// We need to replace here because it is possible new expressions are added
				// while we are deoptimizing the old ones
				this.expressionsToBeDeoptimized = [];
				if (this.wasPathDeoptmizedWhileOptimized) {
					returnExpression.deoptimizePath(UNKNOWN_PATH);
					this.wasPathDeoptmizedWhileOptimized = false;
				}
			}
			for (const expression of expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
		}
		if (this.callee instanceof MemberExpression && !this.callee.variable) {
			this.callee.object.deoptimizePath(UNKNOWN_PATH);
		}
	}

	deoptimizePath(path: ObjectPath) {
		if (path.length === 0) return;
		const trackedEntities = this.context.deoptimizationTracker.getEntities(path);
		if (trackedEntities.has(this)) return;
		trackedEntities.add(this);
		const returnExpression = this.getReturnExpression();
		if (returnExpression !== UNKNOWN_EXPRESSION) {
			this.wasPathDeoptmizedWhileOptimized = true;
			returnExpression.deoptimizePath(path);
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
		const trackedEntities = recursionTracker.getEntities(path);
		if (trackedEntities.has(returnExpression)) {
			return UnknownValue;
		}
		this.expressionsToBeDeoptimized.push(origin);
		trackedEntities.add(returnExpression);
		const value = returnExpression.getLiteralValueAtPath(path, recursionTracker, origin);
		trackedEntities.delete(returnExpression);
		return value;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	) {
		const returnExpression = this.getReturnExpression(recursionTracker);
		if (this.returnExpression === UNKNOWN_EXPRESSION) {
			return UNKNOWN_EXPRESSION;
		}
		const trackedEntities = recursionTracker.getEntities(path);
		if (trackedEntities.has(returnExpression)) {
			return UNKNOWN_EXPRESSION;
		}
		this.expressionsToBeDeoptimized.push(origin);
		trackedEntities.add(returnExpression);
		const value = returnExpression.getReturnExpressionWhenCalledAtPath(
			path,
			recursionTracker,
			origin
		);
		trackedEntities.delete(returnExpression);
		return value;
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		for (const argument of this.arguments) {
			if (argument.hasEffects(context)) return true;
		}
		if (
			(this.context.options.treeshake as NormalizedTreeshakingOptions).annotations &&
			this.annotations?.some((a: Annotation) => a.pure)
		)
			return false;
		return (
			this.callee.hasEffects(context) ||
			this.callee.hasEffectsWhenCalledAtPath(EMPTY_PATH, this.callOptions, context)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (path.length === 0) return false;
		const trackedExpressions = context.accessed.getEntities(path);
		if (trackedExpressions.has(this)) return false;
		trackedExpressions.add(this);
		return this.getReturnExpression().hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (path.length === 0) return true;
		const trackedExpressions = context.assigned.getEntities(path);
		if (trackedExpressions.has(this)) return false;
		trackedExpressions.add(this);
		return this.getReturnExpression().hasEffectsWhenAssignedAtPath(path, context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		const trackedExpressions = (callOptions.withNew
			? context.instantiated
			: context.called
		).getEntities(path, callOptions);
		if (trackedExpressions.has(this)) return false;
		trackedExpressions.add(this);
		return this.getReturnExpression().hasEffectsWhenCalledAtPath(path, callOptions, context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
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

	initialise() {
		this.callOptions = {
			args: this.arguments,
			withNew: false
		};
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, renderedSurroundingElement }: NodeRenderOptions = BLANK
	) {
		const surroundingELement = renderedParentType || renderedSurroundingElement;
		this.callee.render(
			code,
			options,
			surroundingELement ? { renderedSurroundingElement: surroundingELement } : BLANK
		);
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

	private applyDeoptimizations() {
		this.deoptimized = true;
		if (
			this.callee instanceof MemberExpression &&
			!this.callee.variable &&
			this.callee.mayModifyThisWhenCalledAtPath([], SHARED_RECURSION_TRACKER, this)
		) {
			this.callee.object.deoptimizePath(UNKNOWN_PATH);
		}
		for (const argument of this.arguments) {
			// This will make sure all properties of parameters behave as "unknown"
			argument.deoptimizePath(UNKNOWN_PATH);
		}
	}

	private getReturnExpression(
		recursionTracker: PathTracker = SHARED_RECURSION_TRACKER
	): ExpressionEntity {
		if (this.returnExpression === null) {
			this.returnExpression = UNKNOWN_EXPRESSION;
			return (this.returnExpression = this.callee.getReturnExpressionWhenCalledAtPath(
				EMPTY_PATH,
				recursionTracker,
				this
			));
		}
		return this.returnExpression;
	}
}
