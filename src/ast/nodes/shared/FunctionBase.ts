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
import type { EntityPathTracker, ObjectPath } from '../../utils/PathTracker';
import { EMPTY_PATH, UNKNOWN_PATH, UnknownKey } from '../../utils/PathTracker';
import { UNDEFINED_EXPRESSION } from '../../values';
import type ParameterVariable from '../../variables/ParameterVariable';
import type Variable from '../../variables/Variable';
import BlockStatement from '../BlockStatement';
import type ExportDefaultDeclaration from '../ExportDefaultDeclaration';
import * as NodeType from '../NodeType';
import RestElement from '../RestElement';
import type VariableDeclarator from '../VariableDeclarator';
import { Flag, isFlagSet, setFlag } from './BitFlags';
import type { ExpressionEntity, LiteralValueOrUnknown } from './Expression';
import { UNKNOWN_EXPRESSION, UNKNOWN_RETURN_EXPRESSION } from './Expression';
import {
	doNotDeoptimize,
	type ExpressionNode,
	type GenericEsTreeNode,
	type IncludeChildren,
	NodeBase,
	onlyIncludeSelfNoDeoptimize
} from './Node';
import type { ObjectEntity } from './ObjectEntity';
import type { DeclarationPatternNode } from './Pattern';

export default abstract class FunctionBase extends NodeBase {
	declare body: BlockStatement | ExpressionNode;
	declare params: DeclarationPatternNode[];
	declare preventChildBlockScope: true;
	declare scope: ReturnValueScope;

	/** Marked with #__NO_SIDE_EFFECTS__ annotation */
	declare annotationNoSideEffects?: boolean;

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

	get generator(): boolean {
		return isFlagSet(this.flags, Flag.generator);
	}
	set generator(value: boolean) {
		this.flags = setFlag(this.flags, Flag.generator, value);
	}

	protected get hasCachedEffects(): boolean {
		return isFlagSet(this.flags, Flag.hasEffects);
	}
	protected set hasCachedEffects(value: boolean) {
		this.flags = setFlag(this.flags, Flag.hasEffects, value);
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	): void {
		if (interaction.type === INTERACTION_CALLED && path.length === 0) {
			this.scope.deoptimizeArgumentsOnCall(interaction);
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
			this.scope.deoptimizeAllParameters();
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.getObjectEntity().getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: EntityPathTracker,
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
		if (this.hasCachedEffects) {
			return true;
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
				this.hasCachedEffects = true;
				return true;
			}
		}
		const { propertyReadSideEffects } = this.scope.context.options
			.treeshake as NormalizedTreeshakingOptions;
		for (let index = 0; index < this.params.length; index++) {
			const parameter = this.params[index];
			if (
				parameter.hasEffects(context) ||
				(propertyReadSideEffects &&
					parameter.hasEffectsWhenDestructuring(
						context,
						EMPTY_PATH,
						interaction.args[index + 1] || UNDEFINED_EXPRESSION
					))
			) {
				this.hasCachedEffects = true;
				return true;
			}
		}
		return false;
	}

	/**
	 * If the function (expression or declaration) is only used as function calls
	 */
	protected onlyFunctionCallUsed(): boolean {
		let variable: Variable | null = null;
		if (this.parent.type === NodeType.VariableDeclarator) {
			variable = (this.parent as VariableDeclarator).id.variable ?? null;
		}
		if (this.parent.type === NodeType.ExportDefaultDeclaration) {
			variable = (this.parent as ExportDefaultDeclaration).variable;
		}
		return variable?.getOnlyFunctionCallUsed() ?? false;
	}

	private parameterVariableValuesDeoptimized = false;

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.included) this.includeNode(context);
		if (!(this.parameterVariableValuesDeoptimized || this.onlyFunctionCallUsed())) {
			this.parameterVariableValuesDeoptimized = true;
			this.scope.reassignAllParameters();
		}
		const { brokenFlow } = context;
		context.brokenFlow = false;
		this.body.include(context, includeChildrenRecursively);
		context.brokenFlow = brokenFlow;
	}

	includeCallArguments = this.scope.includeCallArguments.bind(this.scope);

	initialise(): void {
		super.initialise();
		if (this.body instanceof BlockStatement) {
			this.body.addImplicitReturnExpressionToScope();
		} else {
			this.scope.addReturnExpression(this.body);
		}
		if (
			this.annotations &&
			(this.scope.context.options.treeshake as NormalizedTreeshakingOptions).annotations
		) {
			this.annotationNoSideEffects = this.annotations.some(
				comment => comment.type === 'noSideEffects'
			);
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode): this {
		const { body, params } = esTreeNode;
		const { scope } = this;
		const { bodyScope, context } = scope;
		// We need to ensure that parameters are declared before the body is parsed
		// so that the scope already knows all parameters and can detect conflicts
		// when parsing the body.
		const parameters: typeof this.params = (this.params = params.map(
			(parameter: GenericEsTreeNode) =>
				new (context.getNodeConstructor(parameter.type))(this, scope).parseNode(
					parameter
				) as unknown as DeclarationPatternNode
		));
		scope.addParameterVariables(
			parameters.map(
				parameter =>
					parameter.declare('parameter', EMPTY_PATH, UNKNOWN_EXPRESSION) as ParameterVariable[]
			),
			parameters[parameters.length - 1] instanceof RestElement
		);
		this.body = new (context.getNodeConstructor(body.type))(this, bodyScope).parseNode(body);
		return super.parseNode(esTreeNode);
	}

	protected abstract getObjectEntity(): ObjectEntity;
}

FunctionBase.prototype.preventChildBlockScope = true;
FunctionBase.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
FunctionBase.prototype.applyDeoptimizations = doNotDeoptimize;
