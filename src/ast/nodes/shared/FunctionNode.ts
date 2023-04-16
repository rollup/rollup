import { type HasEffectsContext, type InclusionContext } from '../../ExecutionContext';
import type { NodeInteraction } from '../../NodeInteractions';
import { INTERACTION_CALLED } from '../../NodeInteractions';
import FunctionScope from '../../scopes/FunctionScope';
import type { ObjectPath, PathTracker } from '../../utils/PathTracker';
import type BlockStatement from '../BlockStatement';
import Identifier, { type IdentifierWithVariable } from '../Identifier';
import { UNKNOWN_EXPRESSION } from './Expression';
import FunctionBase from './FunctionBase';
import { type IncludeChildren } from './Node';
import { ObjectEntity } from './ObjectEntity';
import { OBJECT_PROTOTYPE } from './ObjectPrototype';
import type { PatternNode } from './Pattern';

export default class FunctionNode extends FunctionBase {
	declare async: boolean;
	declare body: BlockStatement;
	declare id: IdentifierWithVariable | null;
	declare params: readonly PatternNode[];
	declare preventChildBlockScope: true;
	declare scope: FunctionScope;
	protected objectEntity: ObjectEntity | null = null;
	private declare constructedEntity: ObjectEntity;

	createScope(parentScope: FunctionScope): void {
		this.scope = new FunctionScope(parentScope, this.context);
		this.constructedEntity = new ObjectEntity(Object.create(null), OBJECT_PROTOTYPE);
		// This makes sure that all deoptimizations of "this" are applied to the
		// constructed entity.
		this.scope.thisVariable.addEntityToBeDeoptimized(this.constructedEntity);
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
		return !!this.id?.hasEffects(context);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		if (super.hasEffectsOnInteractionAtPath(path, interaction, context)) return true;
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
