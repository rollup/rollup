import { getOrCreate } from '../../../utils/getOrCreate';
import { CallOptions } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { HasEffectsContext } from '../../ExecutionContext';
import ChildScope from '../../scopes/ChildScope';
import Scope from '../../scopes/Scope';
import { EMPTY_PATH, ObjectPath, PathTracker } from '../../utils/PathTracker';
import { LiteralValueOrUnknown, UnknownValue, UNKNOWN_EXPRESSION } from '../../values';
import ClassBody from '../ClassBody';
import Identifier from '../Identifier';
import MethodDefinition from '../MethodDefinition';
import { ExpressionEntity } from './Expression';
import { ExpressionNode, NodeBase } from './Node';

export default class ClassNode extends NodeBase {
	body!: ClassBody;
	id!: Identifier | null;
	superClass!: ExpressionNode | null;
	private classConstructor!: MethodDefinition | null;
	private deoptimizedPrototype = false;
	private deoptimizedStatic = false;
	// Collect deoptimization information if we can resolve a property access, by property name
	private expressionsToBeDeoptimized = new Map<string, DeoptimizableEntity[]>();
	// Known, simple, non-deoptimized static properties are kept in here. They are removed when deoptimized.
	private staticPropertyMap: {[name: string]: ExpressionNode} | null = null;

	bind() {
		super.bind();
	}

	createScope(parentScope: Scope) {
		this.scope = new ChildScope(parentScope);
	}

	deoptimizeAllStatics() {
		for (const name in this.staticPropertyMap) {
			this.deoptimizeStatic(name);
		}
		this.deoptimizedStatic = this.deoptimizedPrototype = true;
	}

	deoptimizePath(path: ObjectPath) {
		const propertyMap = this.getStaticPropertyMap();
		const key = path[0];
		const definition = typeof key === 'string' && propertyMap[key];
		if (path.length === 1) {
			if (definition) {
				this.deoptimizeStatic(key as string);
			} else if (typeof key !== 'string') {
				this.deoptimizeAllStatics();
			}
		} else if (key === 'prototype' && typeof path[1] !== 'string') {
			this.deoptimizedPrototype = true;
		} else if (path.length > 1 && definition) {
			definition.deoptimizePath(path.slice(1));
		}
	}

	deoptimizeStatic(name: string) {
		delete this.staticPropertyMap![name];
		const deoptEntities = this.expressionsToBeDeoptimized.get(name);
		if (deoptEntities) {
			for (const entity of deoptEntities) {
				entity.deoptimizeCache();
			}
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		const key = path[0];
		const definition = typeof key === 'string' && this.getStaticPropertyMap()[key];
		if (path.length === 0 || !definition ||
			(key === 'prototype' ? this.deoptimizedPrototype : this.deoptimizedStatic)) {
			return UnknownValue;
		}

		getOrCreate(this.expressionsToBeDeoptimized, key, () => []).push(origin);
		return definition.getLiteralValueAtPath(
			path.slice(1),
			recursionTracker,
			origin
		);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		const key = path[0];
		const definition = typeof key === 'string' && this.getStaticPropertyMap()[key];

		if (path.length === 0 || !definition ||
			(key === 'prototype' ? this.deoptimizedPrototype : this.deoptimizedStatic)) {
			return UNKNOWN_EXPRESSION;
		}

		getOrCreate(this.expressionsToBeDeoptimized, key, () => []).push(origin);
		return definition.getReturnExpressionWhenCalledAtPath(
			path.slice(1),
			recursionTracker,
			origin
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext) {
		if (path.length === 0) return false;
		if (this.deoptimizedStatic) return true;
		if (this.superClass && this.superClass.hasEffectsWhenAccessedAtPath(path, context)) return true;
		const key = path[0];
		if (key === 'prototype') {
			if (path.length === 1) return false;
			if (this.deoptimizedPrototype) return true;
			const key2 = path[1];
			if (path.length === 2 && typeof key2 === 'string') {
				return mayHaveGetterSetterEffect(this.body, 'get', false, key2, context);
			}
			return true;
		} else if (typeof key === 'string' && path.length === 1) {
			return mayHaveGetterSetterEffect(this.body, 'get', true, key, context);
		} else {
			return true;
		}
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext) {
		if (this.deoptimizedStatic) return true;
		if (this.superClass && this.superClass.hasEffectsWhenAssignedAtPath(path, context)) return true;
		const key = path[0];
		if (key === 'prototype') {
			if (path.length === 1) return false;
			if (this.deoptimizedPrototype) return true;
			const key2 = path[1];
			if (path.length === 2 && typeof key2 === 'string') {
				return mayHaveGetterSetterEffect(this.body, 'set', false, key2, context);
			}
			return true;
		} else if (typeof key === 'string' && path.length === 1) {
			return mayHaveGetterSetterEffect(this.body, 'set', true, key, context);
		} else {
			return true;
		}
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	) {
		if (callOptions.withNew) {
			return path.length > 0 ||
				(this.classConstructor !== null &&
				 this.classConstructor.hasEffectsWhenCalledAtPath(EMPTY_PATH, callOptions, context)) ||
				(this.superClass !== null &&
				 this.superClass.hasEffectsWhenCalledAtPath(path, callOptions, context));
		} else {
			if (path.length !== 1 || this.deoptimizedStatic) return true;
			const key = path[0];
			const definition = typeof key === 'string' && this.getStaticPropertyMap()[key];
			if (!definition) return true;
			return definition.hasEffectsWhenCalledAtPath([], callOptions, context);
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

	mayModifyThisWhenCalledAtPath(
		path: ObjectPath
	) {
		const key = path[0];
		const definition = typeof key === 'string' && this.getStaticPropertyMap()[key];
		if (!definition || this.deoptimizedStatic) return true;
		return definition.mayModifyThisWhenCalledAtPath(path.slice(1));
	}

	private getStaticPropertyMap(): {[name: string]: ExpressionNode} {
		if (this.staticPropertyMap) return this.staticPropertyMap;

		const propertyMap = this.staticPropertyMap = Object.create(null);
		const seen: {[name: string]: boolean} = Object.create(null);
		for (const definition of this.body.body) {
			if (!definition.static) continue;
			// If there are non-identifier-named statics, give up.
			if (definition.computed || !(definition.key instanceof Identifier)) {
				return this.staticPropertyMap = Object.create(null);
			}
			const key = definition.key.name;
			// Not handling duplicate definitions.
			if (seen[key]) {
				delete propertyMap[key];
				continue;
			}
			seen[key] = true;
			if (definition instanceof MethodDefinition) {
				if (definition.kind === "method") { 
					propertyMap[key] = definition.value;
				}
			} else if (definition.value) {
				propertyMap[key] = definition.value;
			}
		}
		return this.staticPropertyMap = propertyMap;
	}
}

function mayHaveGetterSetterEffect(
	body: ClassBody,
	kind: 'get' | 'set', isStatic: boolean, name: string,
	context: HasEffectsContext
) {
	for (const definition of body.body) {
		if (definition instanceof MethodDefinition && definition.static === isStatic && definition.kind === kind) {
			if (definition.computed || !(definition.key instanceof Identifier)) {
				return true;
			}
			if (definition.key.name === name &&
			    definition.value.hasEffectsWhenCalledAtPath([], {args: [], withNew: false}, context)) {
				return true;
			}
		}
	}
	return false;
}
