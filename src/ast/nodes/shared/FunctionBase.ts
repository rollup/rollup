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
import {
	EMPTY_PATH,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH,
	UnknownKey
} from '../../utils/PathTracker';
import { UNDEFINED_EXPRESSION } from '../../values';
import type ParameterVariable from '../../variables/ParameterVariable';
import type Variable from '../../variables/Variable';
import BlockStatement from '../BlockStatement';
import type CallExpression from '../CallExpression';
import type ExportDefaultDeclaration from '../ExportDefaultDeclaration';
import Identifier from '../Identifier';
import RestElement from '../RestElement';
import type SpreadElement from '../SpreadElement';
import type VariableDeclarator from '../VariableDeclarator';
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
	declare params: PatternNode[];
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

	private knownParameters: ExpressionEntity[] = [];
	private allArguments: ExpressionEntity[][] = [];
	/**
	 * updated knownParameters when a call is made to this function
	 * @param newArguments arguments of the call
	 */
	updateKnownArguments(newArguments: ExpressionEntity[]): void {
		for (let position = 0; position < this.params.length; position++) {
			const argument = newArguments[position] ?? UNDEFINED_EXPRESSION;
			const parameter = this.params[position];
			if (!parameter || parameter instanceof RestElement) {
				break;
			}
			const knownParameter = this.knownParameters[position];
			if (knownParameter === undefined) {
				this.knownParameters[position] = argument;
			} else if (knownParameter !== UNKNOWN_EXPRESSION) {
				// update knownParameter with argument
				if (knownParameter === argument) {
					continue;
				}
				if (
					knownParameter instanceof Identifier &&
					argument instanceof Identifier &&
					knownParameter.variable === argument.variable
				) {
					continue;
				}
				const knownLiteral = knownParameter.getLiteralValueAtPath(
					EMPTY_PATH,
					SHARED_RECURSION_TRACKER,
					{
						deoptimizeCache() {}
					}
				);
				const newLiteral = argument.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, {
					deoptimizeCache() {}
				});
				if (knownLiteral !== newLiteral || typeof knownLiteral === 'symbol') {
					this.knownParameters[position] = UNKNOWN_EXPRESSION;
				} // else both are the same literal, no need to update
			}
		}
	}

	forwardArgumentsForFunctionCalledOnce(newArguments: ExpressionEntity[]): void {
		for (let position = 0; position < this.params.length; position++) {
			const argument = newArguments[position] ?? UNDEFINED_EXPRESSION;
			const parameter = this.params[position];
			if (!parameter || parameter instanceof RestElement) {
				break;
			}
			if (parameter instanceof Identifier) {
				const ParameterVariable = parameter.variable as ParameterVariable | null;
				ParameterVariable?.setKnownValue(argument);
			}
		}
	}

	/**
	 * each time tree-shake starts, this method should be called to reoptimize the parameters
	 * a parameter's state will change at most twice:
	 *   `undefined` (no call is made) -> an expression -> `UnknownArgument`
	 * we are sure it will converge, and can use state from last iteration
	 */
	applyFunctionParameterOptimization() {
		if (this.allArguments.length === 1) {
			// we are sure what knownParameters will be, so skip it and do setKnownValue
			this.forwardArgumentsForFunctionCalledOnce(this.allArguments[0]);
			return;
		}

		// reoptimize all arguments, that's why we save them
		for (const argumentsList of this.allArguments) {
			this.updateKnownArguments(argumentsList);
		}
		for (let position = 0; position < this.params.length; position++) {
			const knownParameter = this.knownParameters[position] ?? UNKNOWN_EXPRESSION;
			const parameter = this.params[position];
			const ParameterVariable = parameter.variable as ParameterVariable | null;
			// Parameters without default values
			if (parameter instanceof Identifier) {
				ParameterVariable?.setKnownValue(knownParameter);
			}
		}
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
			this.allArguments.push(args.slice(1) as (ExpressionNode | SpreadElement)[]);
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
					parameter.isReassigned = true;
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

	/**
	 * If the function is assigned/bound/... to some identifier declaration,
	 * getDeclarationVariable will return the Variable entity of that declaration.
	 * It can be used to track if all usages of this function are only function calls.
	 * While there are methods like deoptimizePath,
	 * this one can make sure 100% of usages are function calls.
	 * @returns the Variable entity of the declaration
	 */
	getDeclarationVariable(): Variable | null {
		if (this.parent.type === 'VariableDeclarator') {
			return (this.parent as VariableDeclarator).id.variable ?? null;
		}
		if (this.parent.type === 'ExportDefaultDeclaration') {
			return (this.parent as ExportDefaultDeclaration).variable;
		}
		return null;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		const isIIFE =
			this.parent.type === 'CallExpression' && (this.parent as CallExpression).callee === this;
		if (
			(isIIFE || this.getDeclarationVariable()?.getOnlyFunctionCallUsed()) &&
			this.allArguments.length > 0
		) {
			this.applyFunctionParameterOptimization();
		}
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
		const parameters: typeof this.params = (this.params = []);
		const { scope } = this;
		const { bodyScope, context } = scope;
		// We need to ensure that parameters are declared before the body is parsed
		// so that the scope already knows all parameters and can detect conflicts
		// when parsing the body.
		for (const parameter of params) {
			parameters.push(
				new (context.getNodeConstructor(parameter.type))(this, scope).parseNode(
					parameter
				) as unknown as PatternNode
			);
		}
		scope.addParameterVariables(
			parameters.map(
				parameter => parameter.declare('parameter', UNKNOWN_EXPRESSION) as ParameterVariable[]
			),
			parameters[parameters.length - 1] instanceof RestElement
		);
		this.body = new (context.getNodeConstructor(body.type))(this, bodyScope).parseNode(body);
		return super.parseNode(esTreeNode);
	}

	protected addArgumentToBeDeoptimized(_argument: ExpressionEntity) {}

	protected applyDeoptimizations() {}

	protected abstract getObjectEntity(): ObjectEntity;
}

FunctionBase.prototype.preventChildBlockScope = true;
