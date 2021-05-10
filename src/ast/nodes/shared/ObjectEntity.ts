import { CallOptions } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { HasEffectsContext } from '../../ExecutionContext';
import {
	ObjectPath,
	ObjectPathKey,
	PathTracker,
	UnknownKey,
	UNKNOWN_PATH
} from '../../utils/PathTracker';
import {
	EVENT_ACCESSED,
	EVENT_CALLED,
	ExpressionEntity,
	LiteralValueOrUnknown,
	NodeEvent,
	UnknownValue,
	UNKNOWN_EXPRESSION
} from './Expression';

export interface ObjectProperty {
	key: ObjectPathKey;
	kind: 'init' | 'set' | 'get';
	property: ExpressionEntity;
}

type PropertyMap = Record<string, ExpressionEntity[]>;

export class ObjectEntity extends ExpressionEntity {
	private readonly allProperties: ExpressionEntity[] = [];
	private readonly deoptimizedPaths: Record<string, boolean> = Object.create(null);
	private readonly expressionsToBeDeoptimizedByKey: Record<
		string,
		DeoptimizableEntity[]
	> = Object.create(null);
	private readonly gettersByKey: PropertyMap = Object.create(null);
	private hasUnknownDeoptimizedProperty = false;
	private readonly propertiesAndGettersByKey: PropertyMap = Object.create(null);
	private readonly propertiesAndSettersByKey: PropertyMap = Object.create(null);
	private readonly settersByKey: PropertyMap = Object.create(null);
	private readonly thisParametersToBeDeoptimized = new Set<ExpressionEntity>();
	private readonly unmatchableGetters: ExpressionEntity[] = [];
	private readonly unmatchablePropertiesAndGetters: ExpressionEntity[] = [];
	private readonly unmatchableSetters: ExpressionEntity[] = [];

	// If a PropertyMap is used, this will be taken as propertiesAndGettersByKey
	// and we assume there are no setters or getters
	constructor(
		properties: ObjectProperty[] | PropertyMap,
		private prototypeExpression: ExpressionEntity | null
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
		for (const expressionsToBeDeoptimized of Object.values(this.expressionsToBeDeoptimizedByKey)) {
			for (const expression of expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
		}
		for (const expression of this.thisParametersToBeDeoptimized) {
			expression.deoptimizePath(UNKNOWN_PATH);
		}
	}

	deoptimizePath(path: ObjectPath) {
		if (this.hasUnknownDeoptimizedProperty) return;
		const key = path[0];
		if (path.length === 1) {
			if (typeof key !== 'string') {
				this.deoptimizeAllProperties();
				return;
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
	) {
		if (path.length === 0) {
			return;
		}
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

		this.thisParametersToBeDeoptimized.add(thisParameter);
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
				return;
			}
			for (const property of relevantUnmatchableProperties) {
				property.deoptimizeThisOnEventAtPath(event, subPath, thisParameter, recursionTracker);
			}
		} else {
			for (const properties of Object.values(relevantPropertiesByKey).concat([
				relevantUnmatchableProperties
			])) {
				for (const property of properties) {
					property.deoptimizeThisOnEventAtPath(event, subPath, thisParameter, recursionTracker);
				}
			}
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
				recursionTracker,
				origin
			);
		}
		if (this.prototypeExpression) {
			return this.prototypeExpression.getReturnExpressionWhenCalledAtPath(
				path,
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
			for (const property of this.gettersByKey[key] || this.unmatchableGetters) {
				if (property.hasEffectsWhenAccessedAtPath(subPath, context)) return true;
			}
			if (this.prototypeExpression && !this.propertiesAndGettersByKey[key]) {
				return this.prototypeExpression.hasEffectsWhenAccessedAtPath(path, context);
			}
		} else {
			for (const getters of Object.values(this.gettersByKey).concat([this.unmatchableGetters])) {
				for (const getter of getters) {
					if (getter.hasEffectsWhenAccessedAtPath(subPath, context)) return true;
				}
			}
			if (this.prototypeExpression) {
				return this.prototypeExpression.hasEffectsWhenAccessedAtPath(path, context);
			}
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

		if (typeof key !== 'string') return true;

		const properties = this.settersByKey[key] || this.unmatchableSetters;
		for (const property of properties) {
			if (property.hasEffectsWhenAssignedAtPath(subPath, context)) return true;
		}
		if (this.prototypeExpression && !this.settersByKey[key]) {
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

	private buildPropertyMaps(properties: ObjectProperty[]): void {
		const {
			allProperties,
			propertiesAndGettersByKey,
			propertiesAndSettersByKey,
			settersByKey,
			gettersByKey,
			unmatchablePropertiesAndGetters,
			unmatchableGetters,
			unmatchableSetters
		} = this;
		const unmatchablePropertiesAndSetters: ExpressionEntity[] = [];
		for (let index = properties.length - 1; index >= 0; index--) {
			const { key, kind, property } = properties[index];
			allProperties.push(property);
			if (typeof key !== 'string') {
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

	private getMemberExpression(key: ObjectPathKey): ExpressionEntity | null {
		if (
			this.hasUnknownDeoptimizedProperty ||
			typeof key !== 'string' ||
			this.deoptimizedPaths[key]
		) {
			return UNKNOWN_EXPRESSION;
		}
		const properties = this.propertiesAndGettersByKey[key];
		if (properties?.length === 1) {
			return properties[0];
		}
		if (properties || this.unmatchablePropertiesAndGetters.length > 0) {
			return UNKNOWN_EXPRESSION;
		}
		return null;
	}

	private getMemberExpressionAndTrackDeopt(
		key: ObjectPathKey,
		origin: DeoptimizableEntity
	): ExpressionEntity | null {
		if (key === UnknownKey) {
			return UNKNOWN_EXPRESSION;
		}
		const expression = this.getMemberExpression(key);
		if (expression !== UNKNOWN_EXPRESSION) {
			const expressionsToBeDeoptimized = (this.expressionsToBeDeoptimizedByKey[key] =
				this.expressionsToBeDeoptimizedByKey[key] || []);
			expressionsToBeDeoptimized.push(origin);
		}
		return expression;
	}
}
