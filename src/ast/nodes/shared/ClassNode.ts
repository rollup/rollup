import { getOrCreate } from '../../../utils/getOrCreate';
import { CallOptions } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { HasEffectsContext } from '../../ExecutionContext';
import ChildScope from '../../scopes/ChildScope';
import Scope from '../../scopes/Scope';
import { EMPTY_PATH, ObjectPath, PathTracker } from '../../utils/PathTracker';
import { LiteralValueOrUnknown, UnknownValue, UNKNOWN_EXPRESSION } from '../../values';
import ClassBody from '../ClassBody';
import FunctionExpression from '../FunctionExpression';
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
	private propEffectTables: DynamicPropEffectsTable[] = []
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
				return this.mayHaveGetterSetterEffects('get', false, key2, context);
			}
			return true;
		} else if (typeof key === 'string' && path.length === 1) {
			return this.mayHaveGetterSetterEffects('get', true, key, context);
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
				return this.mayHaveGetterSetterEffects('set', false, key2, context);
			}
			return true;
		} else if (typeof key === 'string' && path.length === 1) {
			return this.mayHaveGetterSetterEffects('set', true, key, context);
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

	mayHaveGetterSetterEffects(kind: 'get' | 'set', isStatic: boolean, name: string, context: HasEffectsContext) {
		const key =  (isStatic ? 1 : 0) + (kind == 'get' ? 2 : 0)
		let table = this.propEffectTables[key]
		if (!table) table = this.propEffectTables[key] = new DynamicPropEffectsTable(this.body, kind, isStatic)
		return table.hasEffects(name, context)
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

const defaultCallOptions = {args: [], withNew: false}

class DynamicPropEffectsTable {
	// Null means we should always assume effects
	methods: {[name: string]: FunctionExpression[]} | null = Object.create(null)

	constructor(body: ClassBody, kind: 'get' | 'set', isStatic: boolean) {
		for (const definition of body.body) {
			if (definition instanceof MethodDefinition &&
			    definition.static === isStatic &&
			    definition.kind === kind) {
				if (definition.computed || !(definition.key instanceof Identifier)) {
					this.methods = null;
					return
				}
				const name = definition.key.name;
				(this.methods![name] || (this.methods![name] = [])).push(definition.value);
			}
		}
	}

	hasEffects(name: string, context: HasEffectsContext) {
		if (!this.methods) return true;
		const methods = this.methods[name];
		return methods && methods.some(m => m.hasEffectsWhenCalledAtPath([], defaultCallOptions, context))
	}
}
