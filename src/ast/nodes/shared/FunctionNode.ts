import { type HasEffectsContext, type InclusionContext } from '../../ExecutionContext';
import type { NodeInteraction } from '../../NodeInteractions';
import { INTERACTION_CALLED } from '../../NodeInteractions';
import type ChildScope from '../../scopes/ChildScope';
import FunctionScope from '../../scopes/FunctionScope';
import {
	EMPTY_PATH,
	type EntityPathTracker,
	type ObjectPath,
	UNKNOWN_PATH
} from '../../utils/PathTracker';
import type BlockStatement from '../BlockStatement';
import Identifier, { type IdentifierWithVariable } from '../Identifier';
import { UNKNOWN_EXPRESSION } from './Expression';
import FunctionBase from './FunctionBase';
import { type IncludeChildren } from './Node';
import { ObjectEntity } from './ObjectEntity';
import { OBJECT_PROTOTYPE } from './ObjectPrototype';
import type { DeclarationPatternNode } from './Pattern';

export default class FunctionNode extends FunctionBase {
	declare body: BlockStatement;
	declare id: IdentifierWithVariable | null;
	declare params: DeclarationPatternNode[];
	declare preventChildBlockScope: true;
	declare scope: FunctionScope;
	protected objectEntity: ObjectEntity | null = null;
	declare private constructedEntity: ObjectEntity;

	createScope(parentScope: ChildScope): void {
		this.scope = new FunctionScope(parentScope, this);
		this.constructedEntity = new ObjectEntity(Object.create(null), OBJECT_PROTOTYPE);
		// This makes sure that all deoptimizations of "this" are applied to the
		// constructed entity.
		this.scope.thisVariable.addArgumentForDeoptimization(this.constructedEntity);
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	): void {
		super.deoptimizeArgumentsOnInteractionAtPath(interaction, path, recursionTracker);
		if (interaction.type === INTERACTION_CALLED && path.length === 0 && interaction.args[0]) {
			// args[0] is the "this" argument
			this.scope.thisVariable.addArgumentForDeoptimization(interaction.args[0]);
		}
	}

	hasEffects(context: HasEffectsContext): boolean {
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
		if (
			this.annotationNoSideEffects &&
			path.length === 0 &&
			interaction.type === INTERACTION_CALLED
		) {
			return false;
		}
		if (super.hasEffectsOnInteractionAtPath(path, interaction, context)) {
			return true;
		}

		if (path.length === 0 && interaction.type === INTERACTION_CALLED) {
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
			if (this.body.hasEffects(context)) {
				this.hasCachedEffects = true;
				return true;
			}
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
		super.include(context, includeChildrenRecursively);
		this.id?.include(context, includeChildrenRecursively);
		const hasArguments = this.scope.argumentsVariable.included;
		for (const parameter of this.params) {
			if (!(parameter instanceof Identifier) || hasArguments) {
				parameter.include(context, includeChildrenRecursively);
			}
		}
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		const hasArguments = this.scope.argumentsVariable.included;
		for (const parameter of this.params) {
			if (!(parameter instanceof Identifier) || hasArguments) {
				parameter.includePath(UNKNOWN_PATH, context);
			}
		}
	}

	initialise(): void {
		super.initialise();
		this.id?.declare('function', EMPTY_PATH, this);
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
