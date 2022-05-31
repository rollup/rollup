import type { NormalizedTreeshakingOptions } from '../../../rollup/types';
import { BLANK } from '../../../utils/blank';
import { type CallOptions, NO_ARGS } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import {
	BROKEN_FLOW_NONE,
	type HasEffectsContext,
	type InclusionContext
} from '../../ExecutionContext';
import { NodeEvent } from '../../NodeEvents';
import ReturnValueScope from '../../scopes/ReturnValueScope';
import {
	EMPTY_PATH,
	type ObjectPath,
	PathTracker,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH,
	UnknownKey
} from '../../utils/PathTracker';
import LocalVariable from '../../variables/LocalVariable';
import AssignmentPattern from '../AssignmentPattern';
import BlockStatement from '../BlockStatement';
import * as NodeType from '../NodeType';
import RestElement from '../RestElement';
import type SpreadElement from '../SpreadElement';
import {
	type ExpressionEntity,
	InclusionOptions,
	LiteralValueOrUnknown,
	UNKNOWN_EXPRESSION,
	UnknownValue
} from './Expression';
import {
	type ExpressionNode,
	type GenericEsTreeNode,
	type IncludeChildren,
	NodeBase
} from './Node';
import { ObjectEntity } from './ObjectEntity';
import type { PatternNode } from './Pattern';

export default abstract class FunctionBase extends NodeBase implements DeoptimizableEntity {
	declare async: boolean;
	declare body: BlockStatement | ExpressionNode;
	declare params: readonly PatternNode[];
	declare preventChildBlockScope: true;
	declare scope: ReturnValueScope;
	protected objectEntity: ObjectEntity | null = null;
	private deoptimizedReturn = false;
	private forceIncludeParameters = false;
	private declare parameterVariables: LocalVariable[][];

	deoptimizeCache() {
		this.forceIncludeParameters = true;
	}

	deoptimizeCallParameters() {
		this.forceIncludeParameters = true;
	}

	deoptimizePath(path: ObjectPath): void {
		this.getObjectEntity().deoptimizePath(path);
		if (path.length === 1 && path[0] === UnknownKey) {
			// A reassignment of UNKNOWN_PATH is considered equivalent to having lost track
			// which means the return expression needs to be reassigned
			this.forceIncludeParameters = true;
			this.scope.getReturnExpression().deoptimizePath(UNKNOWN_PATH);
		}
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	): void {
		if (path.length > 0) {
			this.getObjectEntity().deoptimizeThisOnEventAtPath(
				event,
				path,
				thisParameter,
				recursionTracker
			);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.getObjectEntity().getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (path.length > 0) {
			return this.getObjectEntity().getReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				recursionTracker,
				origin
			);
		}
		if (this.async) {
			if (!this.deoptimizedReturn) {
				this.deoptimizedReturn = true;
				this.scope.getReturnExpression().deoptimizePath(UNKNOWN_PATH);
				this.context.requestTreeshakingPass();
			}
			return UNKNOWN_EXPRESSION;
		}
		return this.scope.getReturnExpression();
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return this.getObjectEntity().hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return this.getObjectEntity().hasEffectsWhenAssignedAtPath(path, context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		if (path.length > 0) {
			return this.getObjectEntity().hasEffectsWhenCalledAtPath(path, callOptions, context);
		}
		if (this.async) {
			const { propertyReadSideEffects } = this.context.options
				.treeshake as NormalizedTreeshakingOptions;
			const returnExpression = this.scope.getReturnExpression();
			if (
				returnExpression.hasEffectsWhenCalledAtPath(
					['then'],
					{ args: NO_ARGS, thisParam: null, withNew: false },
					context
				) ||
				(propertyReadSideEffects &&
					(propertyReadSideEffects === 'always' ||
						returnExpression.hasEffectsWhenAccessedAtPath(['then'], context)))
			) {
				return true;
			}
		}
		for (let position = 0; position < this.params.length; position++) {
			const parameter = this.params[position];
			if (parameter instanceof AssignmentPattern) {
				if (parameter.left.hasEffects(context)) {
					return true;
				}
				const argumentValue = callOptions.args[position]?.getLiteralValueAtPath(
					EMPTY_PATH,
					SHARED_RECURSION_TRACKER,
					this
				);
				if (
					(argumentValue === undefined || argumentValue === UnknownValue) &&
					parameter.right.hasEffects(context)
				) {
					return true;
				}
			} else if (parameter.hasEffects(context)) {
				return true;
			}
		}
		return false;
	}

	include(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		{ includeWithoutParameterDefaults }: InclusionOptions = BLANK
	): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		this.included = true;
		const { brokenFlow } = context;
		context.brokenFlow = BROKEN_FLOW_NONE;
		this.body.include(context, includeChildrenRecursively);
		context.brokenFlow = brokenFlow;
		if (
			!includeWithoutParameterDefaults ||
			includeChildrenRecursively ||
			this.forceIncludeParameters
		) {
			for (const param of this.params) {
				param.include(context, includeChildrenRecursively);
			}
		}
	}

	includeCallArguments(
		context: InclusionContext,
		args: readonly (ExpressionEntity | SpreadElement)[]
	): void {
		for (let position = 0; position < this.params.length; position++) {
			const parameter = this.params[position];
			if (parameter instanceof AssignmentPattern) {
				if (parameter.left.shouldBeIncluded(context)) {
					parameter.left.include(context, false);
				}
				const argumentValue = args[position]?.getLiteralValueAtPath(
					EMPTY_PATH,
					SHARED_RECURSION_TRACKER,
					this
				);
				// If argumentValue === UnknownTruthyValue, then we do not need to
				// include the default
				if (
					(argumentValue === undefined || argumentValue === UnknownValue) &&
					(this.parameterVariables[position].some(variable => variable.included) ||
						parameter.right.shouldBeIncluded(context))
				) {
					parameter.right.include(context, false);
				}
			} else if (parameter.shouldBeIncluded(context)) {
				parameter.include(context, false);
			}
		}
		this.scope.includeCallArguments(context, args);
	}

	initialise(): void {
		this.parameterVariables = this.params.map(param =>
			param.declare('parameter', UNKNOWN_EXPRESSION)
		);
		this.scope.addParameterVariables(
			this.parameterVariables,
			this.params[this.params.length - 1] instanceof RestElement
		);
		if (this.body instanceof BlockStatement) {
			this.body.addImplicitReturnExpressionToScope();
		} else {
			this.scope.addReturnExpression(this.body);
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode): void {
		if (esTreeNode.body.type === NodeType.BlockStatement) {
			this.body = new BlockStatement(esTreeNode.body, this, this.scope.hoistedBodyVarScope);
		}
		super.parseNode(esTreeNode);
	}

	protected applyDeoptimizations() {
		// We currently do not track deoptimizations of default values, deoptimize them
		// just as we deoptimize call arguments
		for (const param of this.params) {
			if (param instanceof AssignmentPattern) {
				param.right.deoptimizePath(UNKNOWN_PATH);
			}
		}
	}

	protected abstract getObjectEntity(): ObjectEntity;
}

FunctionBase.prototype.preventChildBlockScope = true;
