import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import {
	findFirstOccurrenceOutsideComment,
	NodeRenderOptions,
	RenderOptions
} from '../../utils/renderHelpers';
import CallOptions from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import {
	EMPTY_IMMUTABLE_TRACKER,
	ImmutableEntityPathTracker
} from '../utils/ImmutableEntityPathTracker';
import {
	EMPTY_PATH,
	LiteralValueOrUnknown,
	ObjectPath,
	UNKNOWN_EXPRESSION,
	UNKNOWN_PATH,
	UNKNOWN_VALUE
} from '../values';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { ExpressionNode, INCLUDE_VARIABLES, IncludeChildren, NodeBase } from './shared/Node';
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
						url: 'https://rollupjs.org/guide/en#avoiding-eval'
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
		if (path.length > 0 && !this.context.deoptimizationTracker.track(this, path)) {
			if (this.returnExpression === null) {
				this.returnExpression = this.callee.getReturnExpressionWhenCalledAtPath(
					EMPTY_PATH,
					EMPTY_IMMUTABLE_TRACKER,
					this
				);
			}
			this.returnExpression.deoptimizePath(path);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.returnExpression === null) {
			this.returnExpression = this.callee.getReturnExpressionWhenCalledAtPath(
				EMPTY_PATH,
				recursionTracker,
				this
			);
		}
		if (
			this.returnExpression === UNKNOWN_EXPRESSION ||
			recursionTracker.isTracked(this.returnExpression, path)
		) {
			return UNKNOWN_VALUE;
		}
		this.expressionsToBeDeoptimized.push(origin);
		return this.returnExpression.getLiteralValueAtPath(
			path,
			recursionTracker.track(this.returnExpression, path),
			origin
		);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	) {
		if (this.returnExpression === null) {
			this.returnExpression = this.callee.getReturnExpressionWhenCalledAtPath(
				EMPTY_PATH,
				recursionTracker,
				this
			);
		}
		if (
			this.returnExpression === UNKNOWN_EXPRESSION ||
			recursionTracker.isTracked(this.returnExpression, path)
		) {
			return UNKNOWN_EXPRESSION;
		}
		this.expressionsToBeDeoptimized.push(origin);
		return this.returnExpression.getReturnExpressionWhenCalledAtPath(
			path,
			recursionTracker.track(this.returnExpression, path),
			origin
		);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		for (const argument of this.arguments) {
			if (argument.hasEffects(options)) return true;
		}
		if (this.context.annotations && this.annotatedPure) return false;
		return (
			this.callee.hasEffects(options) ||
			this.callee.hasEffectsWhenCalledAtPath(
				EMPTY_PATH,
				this.callOptions,
				options.getHasEffectsWhenCalledOptions()
			)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length > 0 &&
			!options.hasReturnExpressionBeenAccessedAtPath(path, this) &&
			(this.returnExpression as ExpressionEntity).hasEffectsWhenAccessedAtPath(
				path,
				options.addAccessedReturnExpressionAtPath(path, this)
			)
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length === 0 ||
			(!options.hasReturnExpressionBeenAssignedAtPath(path, this) &&
				(this.returnExpression as ExpressionEntity).hasEffectsWhenAssignedAtPath(
					path,
					options.addAssignedReturnExpressionAtPath(path, this)
				))
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		if (options.hasReturnExpressionBeenCalledAtPath(path, this)) return false;
		return (this.returnExpression as ExpressionEntity).hasEffectsWhenCalledAtPath(
			path,
			callOptions,
			options.addCalledReturnExpressionAtPath(path, this)
		);
	}

	include(includeChildrenRecursively: IncludeChildren) {
		if (includeChildrenRecursively) {
			super.include(includeChildrenRecursively);
			if (
				includeChildrenRecursively === INCLUDE_VARIABLES &&
				this.callee instanceof Identifier &&
				this.callee.variable
			) {
				this.callee.variable.includeInitRecursively();
			}
		} else {
			this.included = true;
			this.callee.include(false);
		}
		this.callee.includeCallArguments(this.arguments);
		if (!(this.returnExpression as ExpressionEntity).included) {
			(this.returnExpression as ExpressionEntity).include(false);
		}
	}

	initialise() {
		this.callOptions = CallOptions.create({
			args: this.arguments,
			callIdentifier: this,
			withNew: false
		});
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
					code.remove(this.arguments[lastIncludedIndex].end, this.end - 1);
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
