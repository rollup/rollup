import { EMPTY_ARRAY } from '../../../utils/blank';
import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { type HasEffectsContext, type InclusionContext } from '../../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import { INTERACTION_CALLED } from '../../NodeInteractions';
import type ChildScope from '../../scopes/ChildScope';
import FunctionScope from '../../scopes/FunctionScope';
import {
	EMPTY_PATH,
	type EntityPathTracker,
	type ObjectPath,
	SymbolHasInstance,
	UNKNOWN_PATH
} from '../../utils/PathTracker';
import { UNKNOWN_LITERAL_BOOLEAN } from '../../values';
import type BlockStatement from '../BlockStatement';
import Identifier, { type IdentifierWithVariable } from '../Identifier';
import { Flag, isFlagSet, setFlag } from './BitFlags';
import {
	ExpressionEntity,
	UNKNOWN_EXPRESSION,
	UNKNOWN_RETURN_EXPRESSION,
	UnknownValue
} from './Expression';
import FunctionBase from './FunctionBase';
import { Method } from './MethodTypes';
import { type IncludeChildren } from './Node';
import { ObjectEntity } from './ObjectEntity';
import { OBJECT_PROTOTYPE } from './ObjectPrototype';
import type { DeclarationPatternNode } from './Pattern';

const FALSE_EXPRESSION = new (class extends ExpressionEntity {
	getLiteralValueAtPath(path: ObjectPath) {
		if (path.length) return UnknownValue;
		return false;
	}
})();

export class HasInstanceDefaultImplementation extends Method implements DeoptimizableEntity {
	declare private returnExpression: ExpressionEntity;
	private expressionsToDeoptimize: DeoptimizableEntity[] = [];

	private get hasDeoptimizedCache(): boolean {
		return isFlagSet(this.flags, Flag.hasDeoptimizedCache);
	}
	private set hasDeoptimizedCache(value: boolean) {
		this.flags = setFlag(this.flags, Flag.hasDeoptimizedCache, value);
	}

	constructor(
		public parent: ExpressionEntity,
		public scope: ChildScope
	) {
		super({
			callsArgs: null,
			mutatesArgs: false,
			mutatesSelfAsArray: false,
			returns: null!,
			returnsPrimitive: null
		});
	}

	deoptimizeCache(): void {
		const { expressionsToDeoptimize } = this;
		this.hasDeoptimizedCache = true;
		this.expressionsToDeoptimize = EMPTY_ARRAY as unknown as DeoptimizableEntity[];
		if (expressionsToDeoptimize.length) {
			this.scope.context.requestTreeshakingPass();
			for (const expression of expressionsToDeoptimize) {
				expression.deoptimizeCache();
			}
		}
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		_interaction: NodeInteractionCalled,
		_recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		if (path.length) return UNKNOWN_RETURN_EXPRESSION;
		if (this.hasDeoptimizedCache || this.parent.included) return [UNKNOWN_LITERAL_BOOLEAN, true];

		this.expressionsToDeoptimize.push(origin);
		return [FALSE_EXPRESSION, true];
	}
}

export default class FunctionNode extends FunctionBase {
	declare body: BlockStatement;
	declare id: IdentifierWithVariable | null;
	declare params: DeclarationPatternNode[];
	declare preventChildBlockScope: true;
	declare scope: FunctionScope;
	protected objectEntity: ObjectEntity | null = null;
	declare private constructedEntity: ObjectEntity;
	declare private defaultHasInstance: HasInstanceDefaultImplementation;

	createScope(parentScope: ChildScope): void {
		this.scope = new FunctionScope(parentScope, this);
		this.constructedEntity = new ObjectEntity([], OBJECT_PROTOTYPE);
		// This makes sure that all deoptimizations of "this" are applied to the
		// constructed entity.
		this.scope.thisVariable.addArgumentForDeoptimization(this.constructedEntity);
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	): void {
		this.defaultHasInstance.deoptimizeCache();
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
		this.defaultHasInstance.deoptimizeCache();
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
		this.defaultHasInstance = new HasInstanceDefaultImplementation(this, this.scope);
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
				},
				{
					key: SymbolHasInstance,
					kind: 'init',
					property: this.defaultHasInstance
				}
			],
			OBJECT_PROTOTYPE
		));
	}
}
