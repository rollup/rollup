import { CallOptions } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { HasEffectsContext } from '../../ExecutionContext';
import ChildScope from '../../scopes/ChildScope';
import Scope from '../../scopes/Scope';
import { ObjectProperty } from '../../utils/ObjectPathHandler';
import {
	EMPTY_PATH,
	ObjectPath,
	PathTracker,
	SHARED_RECURSION_TRACKER,
	UnknownKey
} from '../../utils/PathTracker';
import { LiteralValueOrUnknown, UnknownValue } from '../../values';
import ClassBody from '../ClassBody';
import Identifier from '../Identifier';
import Literal from '../Literal';
import MethodDefinition from '../MethodDefinition';
import { ExpressionEntity } from './Expression';
import { ExpressionNode, NodeBase } from './Node';
import { ObjectEntity } from './ObjectEntity';

export default class ClassNode extends NodeBase implements DeoptimizableEntity {
	body!: ClassBody;
	id!: Identifier | null;
	superClass!: ExpressionNode | null;

	private classConstructor!: MethodDefinition | null;
	private objectEntity: ObjectEntity | null = null;

	createScope(parentScope: Scope) {
		this.scope = new ChildScope(parentScope);
	}

	deoptimizeCache() {
		this.getObjectEntity().deoptimizeAllProperties();
	}

	deoptimizePath(path: ObjectPath) {
		this.getObjectEntity().deoptimizePath(path);
	}

	// TODO Lukas also check super class, prototype
	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.getObjectEntity().getLiteralValueAtPath(path, recursionTracker, origin);
	}

	// TODO Lukas also check super class
	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return this.getObjectEntity().getReturnExpressionWhenCalledAtPath(
			path,
			recursionTracker,
			origin
		);
	}

	// TODO Lukas also check super class
	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext) {
		// TODO Lukas if there is no direct match and no effect, also check superclass
		return this.getObjectEntity().hasEffectsWhenAccessedAtPath(path, context);
	}

	// TODO Lukas prototype
	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext) {
		return this.getObjectEntity().hasEffectsWhenAssignedAtPath(path, context);
	}

	// TODO Lukas also check super class
	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	) {
		if (path.length === 0) {
			return (
				!callOptions.withNew ||
				(this.classConstructor !== null
					? this.classConstructor.hasEffectsWhenCalledAtPath(EMPTY_PATH, callOptions, context)
					: this.superClass !== null &&
					  this.superClass.hasEffectsWhenCalledAtPath(path, callOptions, context))
			);
		} else {
			return this.getObjectEntity().hasEffectsWhenCalledAtPath(path, callOptions, context);
		}
	}

	initialise() {
		if (this.id !== null) {
			this.id.declare('class', this);
		}
		for (const method of this.body.body) {
			if (method instanceof MethodDefinition && method.kind === 'constructor') {
				this.classConstructor = method;
				return;
			}
		}
		this.classConstructor = null;
	}

	// TODO Lukas also check super class
	mayModifyThisWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	) {
		return this.getObjectEntity().mayModifyThisWhenCalledAtPath(path, recursionTracker, origin);
	}

	private getObjectEntity(): ObjectEntity {
		if (this.objectEntity !== null) {
			return this.objectEntity;
		}
		const staticProperties: ObjectProperty[] = [];
		const dynamicProperties: ObjectProperty[] = [];
		for (const definition of this.body.body) {
			const properties = definition.static ? staticProperties : dynamicProperties;
			const definitionKind = (definition as MethodDefinition | { kind: undefined }).kind;
			const kind = definitionKind === 'set' || definitionKind === 'get' ? definitionKind : 'init';
			let key: string;
			if (definition.computed) {
				const keyValue = definition.key.getLiteralValueAtPath(
					EMPTY_PATH,
					SHARED_RECURSION_TRACKER,
					this
				);
				if (keyValue === UnknownValue) {
					properties.push({ kind, key: UnknownKey, property: definition });
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
			properties.push({ kind, key, property: definition });
		}
		staticProperties.unshift({
			key: 'prototype',
			kind: 'init',
			property: new ObjectEntity(dynamicProperties)
		});
		return (this.objectEntity = new ObjectEntity(staticProperties));
	}
}
