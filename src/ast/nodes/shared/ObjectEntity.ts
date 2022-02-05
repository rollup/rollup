import { CallOptions } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { HasEffectsContext } from '../../ExecutionContext';
import { EVENT_ACCESSED, EVENT_CALLED, NodeEvent } from '../../NodeEvents';
import {
	ObjectPath,
	ObjectPathKey,
	PathTracker,
	UNKNOWN_INTEGER_PATH,
	UNKNOWN_PATH,
	UnknownInteger,
	UnknownKey
} from '../../utils/PathTracker';
import {
	ExpressionEntity,
	LiteralValueOrUnknown,
	UNKNOWN_EXPRESSION,
	UnknownValue
} from './Expression';

export interface ObjectProperty {
	key: ObjectPathKey;
	kind: 'init' | 'set' | 'get';
	property: ExpressionEntity;
}

export interface PropertyMap {
	[key: string]: ExpressionEntity[];
}
const INTEGER_REG_EXP = /^\d+$/;

export class ObjectEntity extends ExpressionEntity {
	private readonly allProperties: ExpressionEntity[] = [];
	private readonly deoptimizedPaths: Record<string, boolean> = Object.create(null);
	private readonly expressionsToBeDeoptimizedByKey: Record<string, DeoptimizableEntity[]> =
		Object.create(null);
	private readonly gettersByKey: PropertyMap = Object.create(null);
	private hasUnknownDeoptimizedInteger = false;
	private hasUnknownDeoptimizedProperty = false;
	private readonly propertiesAndGettersByKey: PropertyMap = Object.create(null);
	private readonly propertiesAndSettersByKey: PropertyMap = Object.create(null);
	private readonly settersByKey: PropertyMap = Object.create(null);
	private readonly thisParametersToBeDeoptimized = new Set<ExpressionEntity>();
	private readonly unknownIntegerProps: ExpressionEntity[] = [];
	private readonly unmatchableGetters: ExpressionEntity[] = [];
	private readonly unmatchablePropertiesAndGetters: ExpressionEntity[] = [];
	private readonly unmatchableSetters: ExpressionEntity[] = [];

	// If a PropertyMap is used, this will be taken as propertiesAndGettersByKey
	// and we assume there are no setters or getters
	constructor(
		properties: ObjectProperty[] | PropertyMap,
		private prototypeExpression: ExpressionEntity | null,
		private immutable = false
	) {
		super();
		if (Array.isArray(properties)) {
			this.buildPropertyMaps(properties);
		} else {
			this.propertiesAndGettersByKey = this.propertiesAndSettersByKey = properties;
			for (const propertiesForKey of Object.values(properties)) {
				this.allProperties.push(...propertiesForKey);
			}
		}
	}

	deoptimizeAllProperties(): void {
		if (this.hasUnknownDeoptimizedProperty) {
			return;
		}
		this.hasUnknownDeoptimizedProperty = true;
		for (const properties of Object.values(this.propertiesAndGettersByKey).concat(
			Object.values(this.settersByKey)
		)) {
			for (const property of properties) {
				property.deoptimizePath(UNKNOWN_PATH);
			}
		}
		// While the prototype itself cannot be mutated, each property can
		this.prototypeExpression?.deoptimizePath([UnknownKey, UnknownKey]);
		this.deoptimizeCachedEntities();
	}

	deoptimizeIntegerProperties(): void {
		if (this.hasUnknownDeoptimizedProperty || this.hasUnknownDeoptimizedInteger) {
			return;
		}
		this.hasUnknownDeoptimizedInteger = true;
		for (const [key, propertiesAndGetters] of Object.entries(this.propertiesAndGettersByKey)) {
			if (INTEGER_REG_EXP.test(key)) {
				for (const property of propertiesAndGetters) {
					property.deoptimizePath(UNKNOWN_PATH);
				}
			}
		}
		this.deoptimizeCachedIntegerEntities();
	}

	deoptimizePath(path: ObjectPath): void {
		if (this.hasUnknownDeoptimizedProperty || this.immutable) return;
		const key = path[0];
		if (path.length === 1) {
			if (typeof key !== 'string') {
				if (key === UnknownInteger) {
					return this.deoptimizeIntegerProperties();
				}
				return this.deoptimizeAllProperties();
			}
			if (!this.deoptimizedPaths[key]) {
				this.deoptimizedPaths[key] = true;

				// we only deoptimizeCache exact matches as in all other cases,
				// we do not return a literal value or return expression
				const expressionsToBeDeoptimized = this.expressionsToBeDeoptimizedByKey[key];
				if (expressionsToBeDeoptimized) {
					for (const expression of expressionsToBeDeoptimized) {
						expression.deoptimizeCache();
					}
				}
			}
		}

		const subPath = path.length === 1 ? UNKNOWN_PATH : path.slice(1);
		for (const property of typeof key === 'string'
			? (this.propertiesAndGettersByKey[key] || this.unmatchablePropertiesAndGetters).concat(
					this.settersByKey[key] || this.unmatchableSetters
			  )
			: this.allProperties) {
			property.deoptimizePath(subPath);
		}
		this.prototypeExpression?.deoptimizePath(path.length === 1 ? [UnknownKey, UnknownKey] : path);
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	): void {
		const [key, ...subPath] = path;

		if (
			this.hasUnknownDeoptimizedProperty ||
			// single paths that are deoptimized will not become getters or setters
			((event === EVENT_CALLED || path.length > 1) &&
				typeof key === 'string' &&
				this.deoptimizedPaths[key])
		) {
			thisParameter.deoptimizePath(UNKNOWN_PATH);
			return;
		}

		const [propertiesForExactMatchByKey, relevantPropertiesByKey, relevantUnmatchableProperties] =
			event === EVENT_CALLED || path.length > 1
				? [
						this.propertiesAndGettersByKey,
						this.propertiesAndGettersByKey,
						this.unmatchablePropertiesAndGetters
				  ]
				: event === EVENT_ACCESSED
				? [this.propertiesAndGettersByKey, this.gettersByKey, this.unmatchableGetters]
				: [this.propertiesAndSettersByKey, this.settersByKey, this.unmatchableSetters];

		if (typeof key === 'string') {
			if (propertiesForExactMatchByKey[key]) {
				const properties = relevantPropertiesByKey[key];
				if (properties) {
					for (const property of properties) {
						property.deoptimizeThisOnEventAtPath(event, subPath, thisParameter, recursionTracker);
					}
				}
				if (!this.immutable) {
					this.thisParametersToBeDeoptimized.add(thisParameter);
				}
				return;
			}
			for (const property of relevantUnmatchableProperties) {
				property.deoptimizeThisOnEventAtPath(event, subPath, thisParameter, recursionTracker);
			}
			if (INTEGER_REG_EXP.test(key)) {
				for (const property of this.unknownIntegerProps) {
					property.deoptimizeThisOnEventAtPath(event, subPath, thisParameter, recursionTracker);
				}
			}
		} else {
			for (const properties of Object.values(relevantPropertiesByKey).concat([
				relevantUnmatchableProperties
			])) {
				for (const property of properties) {
					property.deoptimizeThisOnEventAtPath(event, subPath, thisParameter, recursionTracker);
				}
			}
			for (const property of this.unknownIntegerProps) {
				property.deoptimizeThisOnEventAtPath(event, subPath, thisParameter, recursionTracker);
			}
		}
		if (!this.immutable) {
			this.thisParametersToBeDeoptimized.add(thisParameter);
		}
		this.prototypeExpression?.deoptimizeThisOnEventAtPath(
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
		if (path.length === 0) {
			return UnknownValue;
		}
		const key = path[0];
		const expressionAtPath = this.getMemberExpressionAndTrackDeopt(key, origin);
		if (expressionAtPath) {
			return expressionAtPath.getLiteralValueAtPath(path.slice(1), recursionTracker, origin);
		}
		if (this.prototypeExpression) {
			return this.prototypeExpression.getLiteralValueAtPath(path, recursionTracker, origin);
		}
		if (path.length === 1) {
			return undefined;
		}
		return UnknownValue;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (path.length === 0) {
			return UNKNOWN_EXPRESSION;
		}
		const key = path[0];
		const expressionAtPath = this.getMemberExpressionAndTrackDeopt(key, origin);
		if (expressionAtPath) {
			return expressionAtPath.getReturnExpressionWhenCalledAtPath(
				path.slice(1),
				callOptions,
				recursionTracker,
				origin
			);
		}
		if (this.prototypeExpression) {
			return this.prototypeExpression.getReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				recursionTracker,
				origin
			);
		}
		return UNKNOWN_EXPRESSION;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		const [key, ...subPath] = path;
		if (path.length > 1) {
			if (typeof key !== 'string') {
				return true;
			}
			const expressionAtPath = this.getMemberExpression(key);
			if (expressionAtPath) {
				return expressionAtPath.hasEffectsWhenAccessedAtPath(subPath, context);
			}
			if (this.prototypeExpression) {
				return this.prototypeExpression.hasEffectsWhenAccessedAtPath(path, context);
			}
			return true;
		}

		if (this.hasUnknownDeoptimizedProperty) return true;
		if (typeof key === 'string') {
			if (this.propertiesAndGettersByKey[key]) {
				const getters = this.gettersByKey[key];
				if (getters) {
					for (const getter of getters) {
						if (getter.hasEffectsWhenAccessedAtPath(subPath, context)) return true;
					}
				}
				return false;
			}
			for (const getter of this.unmatchableGetters) {
				if (getter.hasEffectsWhenAccessedAtPath(subPath, context)) {
					return true;
				}
			}
		} else {
			for (const getters of Object.values(this.gettersByKey).concat([this.unmatchableGetters])) {
				for (const getter of getters) {
					if (getter.hasEffectsWhenAccessedAtPath(subPath, context)) return true;
				}
			}
		}
		if (this.prototypeExpression) {
			return this.prototypeExpression.hasEffectsWhenAccessedAtPath(path, context);
		}
		return false;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		const [key, ...subPath] = path;
		if (path.length > 1) {
			if (typeof key !== 'string') {
				return true;
			}
			const expressionAtPath = this.getMemberExpression(key);
			if (expressionAtPath) {
				return expressionAtPath.hasEffectsWhenAssignedAtPath(subPath, context);
			}
			if (this.prototypeExpression) {
				return this.prototypeExpression.hasEffectsWhenAssignedAtPath(path, context);
			}
			return true;
		}

		if (this.hasUnknownDeoptimizedProperty) return true;
		// We do not need to test for unknown properties as in that case, hasUnknownDeoptimizedProperty is true
		if (typeof key === 'string') {
			if (this.propertiesAndSettersByKey[key]) {
				const setters = this.settersByKey[key];
				if (setters) {
					for (const setter of setters) {
						if (setter.hasEffectsWhenAssignedAtPath(subPath, context)) return true;
					}
				}
				return false;
			}
			for (const property of this.unmatchableSetters) {
				if (property.hasEffectsWhenAssignedAtPath(subPath, context)) {
					return true;
				}
			}
		}
		if (this.prototypeExpression) {
			return this.prototypeExpression.hasEffectsWhenAssignedAtPath(path, context);
		}
		return false;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		const key = path[0];
		const expressionAtPath = this.getMemberExpression(key);
		if (expressionAtPath) {
			return expressionAtPath.hasEffectsWhenCalledAtPath(path.slice(1), callOptions, context);
		}
		if (this.prototypeExpression) {
			return this.prototypeExpression.hasEffectsWhenCalledAtPath(path, callOptions, context);
		}
		return true;
	}

	private buildPropertyMaps(properties: readonly ObjectProperty[]): void {
		const {
			allProperties,
			propertiesAndGettersByKey,
			propertiesAndSettersByKey,
			settersByKey,
			gettersByKey,
			unknownIntegerProps,
			unmatchablePropertiesAndGetters,
			unmatchableGetters,
			unmatchableSetters
		} = this;
		const unmatchablePropertiesAndSetters: ExpressionEntity[] = [];
		for (let index = properties.length - 1; index >= 0; index--) {
			const { key, kind, property } = properties[index];
			allProperties.push(property);
			if (typeof key !== 'string') {
				if (key === UnknownInteger) {
					unknownIntegerProps.push(property);
					continue;
				}
				if (kind === 'set') unmatchableSetters.push(property);
				if (kind === 'get') unmatchableGetters.push(property);
				if (kind !== 'get') unmatchablePropertiesAndSetters.push(property);
				if (kind !== 'set') unmatchablePropertiesAndGetters.push(property);
			} else {
				if (kind === 'set') {
					if (!propertiesAndSettersByKey[key]) {
						propertiesAndSettersByKey[key] = [property, ...unmatchablePropertiesAndSetters];
						settersByKey[key] = [property, ...unmatchableSetters];
					}
				} else if (kind === 'get') {
					if (!propertiesAndGettersByKey[key]) {
						propertiesAndGettersByKey[key] = [property, ...unmatchablePropertiesAndGetters];
						gettersByKey[key] = [property, ...unmatchableGetters];
					}
				} else {
					if (!propertiesAndSettersByKey[key]) {
						propertiesAndSettersByKey[key] = [property, ...unmatchablePropertiesAndSetters];
					}
					if (!propertiesAndGettersByKey[key]) {
						propertiesAndGettersByKey[key] = [property, ...unmatchablePropertiesAndGetters];
					}
				}
			}
		}
	}

	private deoptimizeCachedEntities() {
		for (const expressionsToBeDeoptimized of Object.values(this.expressionsToBeDeoptimizedByKey)) {
			for (const expression of expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
		}
		for (const expression of this.thisParametersToBeDeoptimized) {
			expression.deoptimizePath(UNKNOWN_PATH);
		}
	}

	private deoptimizeCachedIntegerEntities() {
		for (const [key, expressionsToBeDeoptimized] of Object.entries(
			this.expressionsToBeDeoptimizedByKey
		)) {
			if (INTEGER_REG_EXP.test(key)) {
				for (const expression of expressionsToBeDeoptimized) {
					expression.deoptimizeCache();
				}
			}
		}
		for (const expression of this.thisParametersToBeDeoptimized) {
			expression.deoptimizePath(UNKNOWN_INTEGER_PATH);
		}
	}

	private getMemberExpression(key: ObjectPathKey): ExpressionEntity | null {
		if (
			this.hasUnknownDeoptimizedProperty ||
			typeof key !== 'string' ||
			(this.hasUnknownDeoptimizedInteger && INTEGER_REG_EXP.test(key)) ||
			this.deoptimizedPaths[key]
		) {
			return UNKNOWN_EXPRESSION;
		}
		const properties = this.propertiesAndGettersByKey[key];
		if (properties?.length === 1) {
			return properties[0];
		}
		if (
			properties ||
			this.unmatchablePropertiesAndGetters.length > 0 ||
			(this.unknownIntegerProps.length && INTEGER_REG_EXP.test(key))
		) {
			return UNKNOWN_EXPRESSION;
		}
		return null;
	}

	private getMemberExpressionAndTrackDeopt(
		key: ObjectPathKey,
		origin: DeoptimizableEntity
	): ExpressionEntity | null {
		if (typeof key !== 'string') {
			return UNKNOWN_EXPRESSION;
		}
		const expression = this.getMemberExpression(key);
		if (!(expression === UNKNOWN_EXPRESSION || this.immutable)) {
			const expressionsToBeDeoptimized = (this.expressionsToBeDeoptimizedByKey[key] =
				this.expressionsToBeDeoptimizedByKey[key] || []);
			expressionsToBeDeoptimized.push(origin);
		}
		return expression;
	}
}
