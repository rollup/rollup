import { CallOptions } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { HasEffectsContext } from '../../ExecutionContext';
import { NodeEvent } from '../../NodeEvents';
import ChildScope from '../../scopes/ChildScope';
import Scope from '../../scopes/Scope';
import {
	EMPTY_PATH,
	ObjectPath,
	PathTracker,
	SHARED_RECURSION_TRACKER,
	UnknownKey
} from '../../utils/PathTracker';
import ClassBody from '../ClassBody';
import Identifier from '../Identifier';
import Literal from '../Literal';
import MethodDefinition from '../MethodDefinition';
import { ExpressionEntity, LiteralValueOrUnknown, UnknownValue } from './Expression';
import { ExpressionNode, NodeBase } from './Node';
import { ObjectEntity, ObjectProperty } from './ObjectEntity';
import { ObjectMember } from './ObjectMember';
import { OBJECT_PROTOTYPE } from './ObjectPrototype';

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

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	) {
		this.getObjectEntity().deoptimizeThisOnEventAtPath(
			event,
			path,
			thisParameter,
			recursionTracker
		);
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
		return this.getObjectEntity().getReturnExpressionWhenCalledAtPath(path, callOptions, recursionTracker, origin);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext) {
		return this.getObjectEntity().hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext) {
		return this.getObjectEntity().hasEffectsWhenAssignedAtPath(path, context);
	}

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

	private getObjectEntity(): ObjectEntity {
		if (this.objectEntity !== null) {
			return this.objectEntity;
		}
		const staticProperties: ObjectProperty[] = [];
		const dynamicMethods: ObjectProperty[] = [];
		for (const definition of this.body.body) {
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
			property: new ObjectEntity(
				dynamicMethods,
				this.superClass ? new ObjectMember(this.superClass, 'prototype') : OBJECT_PROTOTYPE
			)
		});
		return (this.objectEntity = new ObjectEntity(
			staticProperties,
			this.superClass || OBJECT_PROTOTYPE
		));
	}
}
