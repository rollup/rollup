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
import { ExpressionNode, NodeBase } from './shared/Node';
import SpreadElement from './SpreadElement';

export default class CallExpression extends NodeBase implements DeoptimizableEntity {
	type: NodeType.tCallExpression;
	callee: ExpressionNode;
	arguments: (ExpressionNode | SpreadElement)[];

	private callOptions: CallOptions;

	// Caching and deoptimization:
	// We collect deoptimization information if returnExpression !== UNKNOWN_EXPRESSION
	private returnExpression: ExpressionEntity | null;
	private expressionsToBeDeoptimized: DeoptimizableEntity[];

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
			this.returnExpression.hasEffectsWhenAccessedAtPath(
				path,
				options.addAccessedReturnExpressionAtPath(path, this)
			)
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length === 0 ||
			(!options.hasReturnExpressionBeenAssignedAtPath(path, this) &&
				this.returnExpression.hasEffectsWhenAssignedAtPath(
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
		const innerOptions = options.addCalledReturnExpressionAtPath(path, this);
		return (
			this.hasEffects(innerOptions) ||
			this.returnExpression.hasEffectsWhenCalledAtPath(path, callOptions, innerOptions)
		);
	}

	include(includeAllChildrenRecursively: boolean) {
		super.include(includeAllChildrenRecursively);
		if (!this.returnExpression.included) {
			this.returnExpression.include(false);
		}
	}

	initialise() {
		this.included = false;
		this.returnExpression = null;
		this.callOptions = CallOptions.create({
			withNew: false,
			args: this.arguments,
			callIdentifier: this
		});
		this.expressionsToBeDeoptimized = [];
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
}
