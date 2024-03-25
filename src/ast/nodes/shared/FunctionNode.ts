import { type HasEffectsContext, type InclusionContext } from '../../ExecutionContext';
import type { NodeInteraction } from '../../NodeInteractions';
import { INTERACTION_CALLED } from '../../NodeInteractions';
import type ChildScope from '../../scopes/ChildScope';
import FunctionScope from '../../scopes/FunctionScope';
import {
	EMPTY_PATH,
	type ObjectPath,
	type PathTracker,
	SHARED_RECURSION_TRACKER
} from '../../utils/PathTracker';
import type ParameterVariable from '../../variables/ParameterVariable';
import type BlockStatement from '../BlockStatement';
import type CallExpression from '../CallExpression';
import Identifier, { type IdentifierWithVariable } from '../Identifier';
import RestElement from '../RestElement';
import type SpreadElement from '../SpreadElement';
import type { ExpressionEntity } from './Expression';
import { UNKNOWN_EXPRESSION } from './Expression';
import FunctionBase from './FunctionBase';
import type { ExpressionNode, IncludeChildren } from './Node';
import { ObjectEntity } from './ObjectEntity';
import { OBJECT_PROTOTYPE } from './ObjectPrototype';
import type { PatternNode } from './Pattern';

type FunctionParameterState =
	| {
			kind: 'TOP';
	  }
	| {
			kind: 'MID';
			expression: ExpressionNode | SpreadElement;
	  }
	| {
			kind: 'BOTTOM';
	  };

export default class FunctionNode extends FunctionBase {
	declare body: BlockStatement;
	declare id: IdentifierWithVariable | null;
	declare params: PatternNode[];
	declare preventChildBlockScope: true;
	declare scope: FunctionScope;
	protected objectEntity: ObjectEntity | null = null;
	private declare constructedEntity: ObjectEntity;

	createScope(parentScope: ChildScope): void {
		this.scope = new FunctionScope(parentScope);
		this.constructedEntity = new ObjectEntity(Object.create(null), OBJECT_PROTOTYPE);
		// This makes sure that all deoptimizations of "this" are applied to the
		// constructed entity.
		this.scope.thisVariable.addEntityToBeDeoptimized(this.constructedEntity);
	}

	private knownParameters: FunctionParameterState[] = [];
	initKnownParameters() {
		if (this.knownParameters.length === 0) {
			this.knownParameters = Array.from({ length: this.params.length }).map(() => ({
				kind: 'TOP'
			}));
		}
	}
	/**
	 * updated knownParameters when a call is made to this function
	 * @param newArguments arguments of the call
	 */
	updateKnownArguments(newArguments: (SpreadElement | ExpressionNode)[]): void {
		this.initKnownParameters();
		for (let position = 0; position < newArguments.length; position++) {
			const argument = newArguments[position];
			const parameter = this.params[position];
			if (!parameter || parameter instanceof RestElement) {
				break;
			}
			const knownParameter = this.knownParameters[position];
			if (knownParameter.kind === 'TOP') {
				this.knownParameters[position] = { expression: argument, kind: 'MID' };
			} else if (knownParameter.kind === 'MID') {
				const knownLiteral = knownParameter.expression.getLiteralValueAtPath(
					EMPTY_PATH,
					SHARED_RECURSION_TRACKER,
					knownParameter.expression.parent as CallExpression
				);
				const newLiteral = argument.getLiteralValueAtPath(
					EMPTY_PATH,
					SHARED_RECURSION_TRACKER,
					argument.parent as CallExpression
				);
				const bothLiteral = typeof knownLiteral !== 'symbol' && typeof newLiteral !== 'symbol';
				if (!bothLiteral || knownLiteral !== newLiteral) {
					this.knownParameters[position] = { kind: 'BOTTOM' };
				} // else both are the same literal, no need to update
			}
		}
	}

	applyFunctionParameterOptimization() {
		for (let position = 0; position < this.params.length; position++) {
			const knownParameter = this.knownParameters[position];
			const parameter = this.params[position];
			if (knownParameter.kind === 'MID' && parameter instanceof Identifier) {
				(parameter.variable as ParameterVariable).setKnownValue(
					knownParameter.expression as ExpressionNode
				);
			}
		}
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		super.deoptimizeArgumentsOnInteractionAtPath(interaction, path, recursionTracker);
		if (interaction.type === INTERACTION_CALLED && path.length === 0 && interaction.args[0]) {
			// args[0] is the "this" argument
			this.scope.thisVariable.addEntityToBeDeoptimized(interaction.args[0]);
		}
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();

		if (this.annotationNoSideEffects) {
			return false;
		}

		return !!this.id?.hasEffects(context);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		if (super.hasEffectsOnInteractionAtPath(path, interaction, context)) return true;

		if (this.annotationNoSideEffects) {
			return false;
		}

		if (interaction.type === INTERACTION_CALLED) {
			const thisInit = context.replacedVariableInits.get(this.scope.thisVariable);
			context.replacedVariableInits.set(
				this.scope.thisVariable,
				interaction.withNew ? this.constructedEntity : UNKNOWN_EXPRESSION
			);
			const { brokenFlow, ignore, replacedVariableInits } = context;
			context.ignore = {
				breaks: false,
				continues: false,
				labels: new Set(),
				returnYield: true,
				this: interaction.withNew
			};
			if (this.body.hasEffects(context)) return true;
			context.brokenFlow = brokenFlow;
			if (thisInit) {
				replacedVariableInits.set(this.scope.thisVariable, thisInit);
			} else {
				replacedVariableInits.delete(this.scope.thisVariable);
			}
			context.ignore = ignore;
		}
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (this.id?.variable.onlyFunctionCallUsed && this.id.variable.argumentsList.length > 0) {
			for (let index = 0; index < this.id.variable.argumentsList.length; index++) {
				this.updateKnownArguments(this.id.variable.argumentsList[index]);
			}
			this.applyFunctionParameterOptimization();
		}
		super.include(context, includeChildrenRecursively);
		this.id?.include();
		const hasArguments = this.scope.argumentsVariable.included;
		for (const parameter of this.params) {
			if (!(parameter instanceof Identifier) || hasArguments) {
				parameter.include(context, includeChildrenRecursively);
			}
		}
	}

	initialise(): void {
		super.initialise();
		this.id?.declare('function', this);
	}

	protected addArgumentToBeDeoptimized(argument: ExpressionEntity) {
		this.scope.argumentsVariable.addArgumentToBeDeoptimized(argument);
	}

	protected getObjectEntity(): ObjectEntity {
		if (this.objectEntity !== null) {
			return this.objectEntity;
		}
		return (this.objectEntity = new ObjectEntity(
			[
				{
					key: 'prototype',
					kind: 'init',
					property: new ObjectEntity([], OBJECT_PROTOTYPE)
				}
			],
			OBJECT_PROTOTYPE
		));
	}
}
