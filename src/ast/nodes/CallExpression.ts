import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import {
	findFirstOccurrenceOutsideComment,
	NodeRenderOptions,
	RenderOptions
} from '../../utils/renderHelpers';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import {
	EMPTY_IMMUTABLE_TRACKER,
	EMPTY_PATH,
	ObjectPath,
	PathTracker,
	UNKNOWN_PATH
} from '../utils/PathTracker';
import { LiteralValueOrUnknown, UNKNOWN_EXPRESSION, UnknownValue } from '../values';
import Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { ExpressionNode, INCLUDE_PARAMETERS, IncludeChildren, NodeBase } from './shared/Node';
import SpreadElement from './SpreadElement';

export default class CallExpression extends NodeBase implements DeoptimizableEntity {
	annotatedPure?: boolean;
	arguments!: (ExpressionNode | SpreadElement)[];
	callee!: ExpressionNode;
	type!: NodeType.tCallExpression;

	private callOptions!: CallOptions;
	// We collect deoptimization information if returnExpression !== UNKNOWN_EXPRESSION
	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];
	private returnExpression: ExpressionEntity | null = null;

	bind() {
		super.bind();
		if (this.callee instanceof Identifier) {
			const variable = this.scope.findVariable(this.callee.name);

			if (variable.isNamespace) {
				this.context.error(
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
		if (this.returnExpression === null) {
			this.returnExpression = this.callee.getReturnExpressionWhenCalledAtPath(
				EMPTY_PATH,
				EMPTY_IMMUTABLE_TRACKER,
				this
			);
		}
		if (this.callee instanceof MemberExpression && !this.callee.variable) {
			this.callee.object.deoptimizePath(UNKNOWN_PATH);
		}
		for (const argument of this.arguments) {
			// This will make sure all properties of parameters behave as "unknown"
			argument.deoptimizePath(UNKNOWN_PATH);
		}
	}

	deoptimizeCache() {
		if (this.returnExpression !== UNKNOWN_EXPRESSION) {
			this.returnExpression = UNKNOWN_EXPRESSION;
			for (const expression of this.expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
		}
	}

	deoptimizePath(path: ObjectPath) {
		if (path.length === 0) return;
		const trackedEntities = this.context.deoptimizationTracker.getEntities(path);
		if (trackedEntities.has(this)) return;
		trackedEntities.add(this);
		if (this.returnExpression === null) {
			this.returnExpression = this.callee.getReturnExpressionWhenCalledAtPath(
				EMPTY_PATH,
				EMPTY_IMMUTABLE_TRACKER,
				this
			);
		}
		this.returnExpression.deoptimizePath(path);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.returnExpression === null) {
			this.returnExpression = this.callee.getReturnExpressionWhenCalledAtPath(
				EMPTY_PATH,
				recursionTracker,
				this
			);
		}
		if (this.returnExpression === UNKNOWN_EXPRESSION) {
			return UnknownValue;
		}
		const trackedEntities = recursionTracker.getEntities(path);
		if (trackedEntities.has(this.returnExpression)) {
			return UnknownValue;
		}
		this.expressionsToBeDeoptimized.push(origin);
		trackedEntities.add(this.returnExpression);
		const value = this.returnExpression.getLiteralValueAtPath(path, recursionTracker, origin);
		trackedEntities.delete(this.returnExpression);
		return value;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	) {
		if (this.returnExpression === null) {
			this.returnExpression = this.callee.getReturnExpressionWhenCalledAtPath(
				EMPTY_PATH,
				recursionTracker,
				this
			);
		}
		if (this.returnExpression === UNKNOWN_EXPRESSION) {
			return UNKNOWN_EXPRESSION;
		}
		const trackedEntities = recursionTracker.getEntities(path);
		if (trackedEntities.has(this.returnExpression)) {
			return UNKNOWN_EXPRESSION;
		}
		this.expressionsToBeDeoptimized.push(origin);
		trackedEntities.add(this.returnExpression);
		const value = this.returnExpression.getReturnExpressionWhenCalledAtPath(
			path,
			recursionTracker,
			origin
		);
		trackedEntities.delete(this.returnExpression);
		return value;
	}

	hasEffects(context: HasEffectsContext): boolean {
		for (const argument of this.arguments) {
			if (argument.hasEffects(context)) return true;
		}
		if (this.context.annotations && this.annotatedPure) return false;
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
		return (this.returnExpression as ExpressionEntity).hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (path.length === 0) return true;
		const trackedExpressions = context.assigned.getEntities(path);
		if (trackedExpressions.has(this)) return false;
		trackedExpressions.add(this);
		return (this.returnExpression as ExpressionEntity).hasEffectsWhenAssignedAtPath(path, context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		const trackedExpressions = (callOptions.withNew
			? context.instantiated
			: context.called
		).getEntities(path);
		if (trackedExpressions.has(this)) return false;
		trackedExpressions.add(this);
		return (this.returnExpression as ExpressionEntity).hasEffectsWhenCalledAtPath(
			path,
			callOptions,
			context
		);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
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
		if (!(this.returnExpression as ExpressionEntity).included) {
			(this.returnExpression as ExpressionEntity).include(context, false);
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
		{ renderedParentType }: NodeRenderOptions = BLANK
	) {
		this.callee.render(code, options);
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
		if (
			renderedParentType === NodeType.ExpressionStatement &&
			this.callee.type === NodeType.FunctionExpression
		) {
			code.appendRight(this.start, '(');
			code.prependLeft(this.end, ')');
		}
	}
}
