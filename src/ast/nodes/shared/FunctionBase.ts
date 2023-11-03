import type { NormalizedTreeshakingOptions } from '../../../rollup/types';
import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { type HasEffectsContext, type InclusionContext } from '../../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import {
	INTERACTION_CALLED,
	NODE_INTERACTION_UNKNOWN_ACCESS,
	NODE_INTERACTION_UNKNOWN_CALL
} from '../../NodeInteractions';
import type ReturnValueScope from '../../scopes/ReturnValueScope';
import type { ObjectPath, PathTracker } from '../../utils/PathTracker';
import { UNKNOWN_PATH, UnknownKey } from '../../utils/PathTracker';
import type ParameterVariable from '../../variables/ParameterVariable';
import BlockStatement from '../BlockStatement';
import Identifier from '../Identifier';
import * as NodeType from '../NodeType';
import RestElement from '../RestElement';
import type SpreadElement from '../SpreadElement';
import { Flag, isFlagSet, setFlag } from './BitFlags';
import type { ExpressionEntity, LiteralValueOrUnknown } from './Expression';
import { UNKNOWN_EXPRESSION, UNKNOWN_RETURN_EXPRESSION } from './Expression';
import {
	type ExpressionNode,
	type GenericEsTreeNode,
	type IncludeChildren,
	NodeBase
} from './Node';
import type { ObjectEntity } from './ObjectEntity';
import type { PatternNode } from './Pattern';

export default abstract class FunctionBase extends NodeBase {
	declare body: BlockStatement | ExpressionNode;
	declare params: readonly PatternNode[];
	declare preventChildBlockScope: true;
	declare scope: ReturnValueScope;

	get async(): boolean {
		return isFlagSet(this.flags, Flag.async);
	}
	set async(value: boolean) {
		this.flags = setFlag(this.flags, Flag.async, value);
	}

	get deoptimizedReturn(): boolean {
		return isFlagSet(this.flags, Flag.deoptimizedReturn);
	}
	set deoptimizedReturn(value: boolean) {
		this.flags = setFlag(this.flags, Flag.deoptimizedReturn, value);
	}

	protected objectEntity: ObjectEntity | null = null;

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		if (interaction.type === INTERACTION_CALLED) {
			const { parameters } = this.scope;
			const { args } = interaction;
			let hasRest = false;
			for (let position = 0; position < args.length - 1; position++) {
				const parameter = this.params[position];
				// Only the "this" argument arg[0] can be null
				const argument = args[position + 1]!;
				if (hasRest || parameter instanceof RestElement) {
					hasRest = true;
					argument.deoptimizePath(UNKNOWN_PATH);
				} else if (parameter instanceof Identifier) {
					parameters[position][0].addEntityToBeDeoptimized(argument);
					this.addArgumentToBeDeoptimized(argument);
				} else if (parameter) {
					argument.deoptimizePath(UNKNOWN_PATH);
				} else {
					this.addArgumentToBeDeoptimized(argument);
				}
			}
		} else {
			this.getObjectEntity().deoptimizeArgumentsOnInteractionAtPath(
				interaction,
				path,
				recursionTracker
			);
		}
	}

	deoptimizePath(path: ObjectPath): void {
		this.getObjectEntity().deoptimizePath(path);
		if (path.length === 1 && path[0] === UnknownKey) {
			// A reassignment of UNKNOWN_PATH is considered equivalent to having lost track
			// which means the return expression and parameters need to be reassigned
			this.scope.getReturnExpression().deoptimizePath(UNKNOWN_PATH);
			for (const parameterList of this.scope.parameters) {
				for (const parameter of parameterList) {
					parameter.deoptimizePath(UNKNOWN_PATH);
				}
			}
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
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		if (path.length > 0) {
			return this.getObjectEntity().getReturnExpressionWhenCalledAtPath(
				path,
				interaction,
				recursionTracker,
				origin
			);
		}
		if (this.async) {
			if (!this.deoptimizedReturn) {
				this.deoptimizedReturn = true;
				this.scope.getReturnExpression().deoptimizePath(UNKNOWN_PATH);
				this.scope.context.requestTreeshakingPass();
			}
			return UNKNOWN_RETURN_EXPRESSION;
		}
		return [this.scope.getReturnExpression(), false];
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		if (path.length > 0 || interaction.type !== INTERACTION_CALLED) {
			return this.getObjectEntity().hasEffectsOnInteractionAtPath(path, interaction, context);
		}

		if (this.annotationNoSideEffects) {
			return false;
		}

		if (this.async) {
			const { propertyReadSideEffects } = this.scope.context.options
				.treeshake as NormalizedTreeshakingOptions;
			const returnExpression = this.scope.getReturnExpression();
			if (
				returnExpression.hasEffectsOnInteractionAtPath(
					['then'],
					NODE_INTERACTION_UNKNOWN_CALL,
					context
				) ||
				(propertyReadSideEffects &&
					(propertyReadSideEffects === 'always' ||
						returnExpression.hasEffectsOnInteractionAtPath(
							['then'],
							NODE_INTERACTION_UNKNOWN_ACCESS,
							context
						)))
			) {
				return true;
			}
		}
		for (const parameter of this.params) {
			if (parameter.hasEffects(context)) return true;
		}
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		this.included = true;
		const { brokenFlow } = context;
		context.brokenFlow = false;
		this.body.include(context, includeChildrenRecursively);
		context.brokenFlow = brokenFlow;
	}

	includeCallArguments(
		context: InclusionContext,
		parameters: readonly (ExpressionEntity | SpreadElement)[]
	): void {
		this.scope.includeCallArguments(context, parameters);
	}

	initialise(): void {
		this.scope.addParameterVariables(
			this.params.map(
				parameter => parameter.declare('parameter', UNKNOWN_EXPRESSION) as ParameterVariable[]
			),
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

	protected addArgumentToBeDeoptimized(_argument: ExpressionEntity) {}

	protected applyDeoptimizations() {}

	protected abstract getObjectEntity(): ObjectEntity;
}

FunctionBase.prototype.preventChildBlockScope = true;
