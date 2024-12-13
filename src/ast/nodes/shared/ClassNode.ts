import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { type HasEffectsContext, type InclusionContext } from '../../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import { INTERACTION_CALLED } from '../../NodeInteractions';
import ChildScope from '../../scopes/ChildScope';
import { checkEffectForNodes } from '../../utils/checkEffectForNodes';
import {
	EMPTY_PATH,
	type EntityPathTracker,
	type ObjectPath,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH,
	UnknownKey
} from '../../utils/PathTracker';
import type ClassBody from '../ClassBody';
import type Decorator from '../Decorator';
import Identifier from '../Identifier';
import type Literal from '../Literal';
import MethodDefinition from '../MethodDefinition';
import { isStaticBlock } from '../StaticBlock';
import { type ExpressionEntity, type LiteralValueOrUnknown } from './Expression';
import { type ExpressionNode, type IncludeChildren, NodeBase, onlyIncludeSelf } from './Node';
import { ObjectEntity, type ObjectProperty } from './ObjectEntity';
import { ObjectMember } from './ObjectMember';
import { OBJECT_PROTOTYPE } from './ObjectPrototype';

export default class ClassNode extends NodeBase implements DeoptimizableEntity {
	declare body: ClassBody;
	declare id: Identifier | null;
	declare superClass: ExpressionNode | null;
	declare decorators: Decorator[];
	declare private classConstructor: MethodDefinition | null;
	private objectEntity: ObjectEntity | null = null;

	createScope(parentScope: ChildScope): void {
		this.scope = new ChildScope(parentScope, parentScope.context);
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	): void {
		this.getObjectEntity().deoptimizeArgumentsOnInteractionAtPath(
			interaction,
			path,
			recursionTracker
		);
	}

	deoptimizeCache(): void {
		this.getObjectEntity().deoptimizeAllProperties();
	}

	deoptimizePath(path: ObjectPath): void {
		this.getObjectEntity().deoptimizePath(path);
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
		return this.getObjectEntity().getReturnExpressionWhenCalledAtPath(
			path,
			interaction,
			recursionTracker,
			origin
		);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		const initEffect = this.superClass?.hasEffects(context) || this.body.hasEffects(context);
		this.id?.markDeclarationReached();
		return initEffect || super.hasEffects(context) || checkEffectForNodes(this.decorators, context);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		return interaction.type === INTERACTION_CALLED && path.length === 0
			? !interaction.withNew ||
					(this.classConstructor === null
						? this.superClass?.hasEffectsOnInteractionAtPath(path, interaction, context)
						: this.classConstructor.hasEffectsOnInteractionAtPath(path, interaction, context)) ||
					false
			: this.getObjectEntity().hasEffectsOnInteractionAtPath(path, interaction, context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.included) this.includeNode(context);
		this.superClass?.include(context, includeChildrenRecursively);
		this.body.include(context, includeChildrenRecursively);
		for (const decorator of this.decorators) decorator.include(context, includeChildrenRecursively);
		if (this.id) {
			this.id.markDeclarationReached();
			this.id.include(context);
		}
	}

	initialise(): void {
		super.initialise();
		this.id?.declare('class', EMPTY_PATH, this);
		for (const method of this.body.body) {
			if (method instanceof MethodDefinition && method.kind === 'constructor') {
				this.classConstructor = method;
				return;
			}
		}
		this.classConstructor = null;
	}

	applyDeoptimizations() {
		this.deoptimized = true;
		for (const definition of this.body.body) {
			if (
				!isStaticBlock(definition) &&
				!(
					definition.static ||
					(definition instanceof MethodDefinition && definition.kind === 'constructor')
				)
			) {
				// Calls to methods are not tracked, ensure that the return value is deoptimized
				definition.deoptimizePath(UNKNOWN_PATH);
			}
		}
		this.scope.context.requestTreeshakingPass();
	}

	private getObjectEntity(): ObjectEntity {
		if (this.objectEntity !== null) {
			return this.objectEntity;
		}
		const staticProperties: ObjectProperty[] = [];
		const dynamicMethods: ObjectProperty[] = [];
		for (const definition of this.body.body) {
			if (isStaticBlock(definition)) continue;
			const properties = definition.static ? staticProperties : dynamicMethods;
			const definitionKind = (definition as MethodDefinition | { kind: undefined }).kind;
			// Note that class fields do not end up on the prototype
			if (properties === dynamicMethods && !definitionKind) continue;
			const kind = definitionKind === 'set' || definitionKind === 'get' ? definitionKind : 'init';
			let key: string;
			if (definition.computed) {
				const keyValue = definition.key.getLiteralValueAtPath(
					EMPTY_PATH,
					SHARED_RECURSION_TRACKER,
					this
				);
				if (typeof keyValue === 'symbol') {
					properties.push({ key: UnknownKey, kind, property: definition });
					continue;
				} else {
					key = String(keyValue);
				}
			} else {
				key =
					definition.key instanceof Identifier
						? definition.key.name
						: String((definition.key as Literal).value);
			}
			properties.push({ key, kind, property: definition });
		}
		staticProperties.unshift({
			key: 'prototype',
			kind: 'init',
			property: new ObjectEntity(
				dynamicMethods,
				this.superClass ? new ObjectMember(this.superClass, ['prototype']) : OBJECT_PROTOTYPE
			)
		});
		return (this.objectEntity = new ObjectEntity(
			staticProperties,
			this.superClass || OBJECT_PROTOTYPE
		));
	}
}

ClassNode.prototype.includeNode = onlyIncludeSelf;
