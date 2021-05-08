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

// TODO Lukas add a way to directly inject only propertiesByKey and create allProperties lazily/not
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

	constructor(properties: ObjectProperty[], private prototypeExpression: ExpressionEntity | null) {
		super();
		this.buildPropertyMaps(properties);
	}

	deoptimizeAllProperties(): void {
		if (this.hasUnknownDeoptimizedProperty) {
			return;
		}
		this.hasUnknownDeoptimizedProperty = true;
		for (const property of this.allProperties) {
			property.deoptimizePath(UNKNOWN_PATH);
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
		// TODO Lukas only if we have no hit here, we need to continue with the prototype
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

		if (event === EVENT_CALLED || path.length > 1) {
			// TODO Lukas having the same logic as for the other cases here by checking getters and props
			const expressionAtPath = this.getMemberExpressionAndTrackDeopt(key, {
				deoptimizeCache() {
					thisParameter.deoptimizePath(UNKNOWN_PATH);
				}
			});
			if (expressionAtPath) {
				return expressionAtPath.deoptimizeThisOnEventAtPath(
					event,
					subPath,
					thisParameter,
					recursionTracker
				);
			}
			if (this.prototypeExpression) {
				return this.prototypeExpression.deoptimizeThisOnEventAtPath(
					event,
					path,
					thisParameter,
					recursionTracker
				);
			}
			// TODO Lukas check in how far those cases can be merged
		} else if (event === EVENT_ACCESSED) {
			if (this.hasUnknownDeoptimizedProperty) {
				return thisParameter.deoptimizePath(UNKNOWN_PATH);
			}
			this.thisParametersToBeDeoptimized.add(thisParameter);

			if (typeof key === 'string') {
				for (const property of this.gettersByKey[key] || this.unmatchableGetters) {
					property.deoptimizeThisOnEventAtPath(
						EVENT_ACCESSED,
						subPath,
						thisParameter,
						recursionTracker
					);
				}
				if (this.prototypeExpression && !this.propertiesAndGettersByKey[key]) {
					this.prototypeExpression.deoptimizeThisOnEventAtPath(
						EVENT_ACCESSED,
						path,
						thisParameter,
						recursionTracker
					);
				}
			} else {
				for (const getters of Object.values(this.gettersByKey).concat([this.unmatchableGetters])) {
					for (const getter of getters) {
						getter.deoptimizeThisOnEventAtPath(
							EVENT_ACCESSED,
							subPath,
							thisParameter,
							recursionTracker
						);
					}
				}
				if (this.prototypeExpression) {
					return this.prototypeExpression.deoptimizeThisOnEventAtPath(
						EVENT_ACCESSED,
						path,
						thisParameter,
						recursionTracker
					);
				}
			}
		} else {
			if (this.hasUnknownDeoptimizedProperty) {
				return thisParameter.deoptimizePath(UNKNOWN_PATH);
			}
			this.thisParametersToBeDeoptimized.add(thisParameter);

			if (typeof key === 'string') {
				for (const property of this.settersByKey[key] || this.unmatchableSetters) {
					property.deoptimizeThisOnEventAtPath(event, subPath, thisParameter, recursionTracker);
				}
				if (this.prototypeExpression && !this.propertiesAndSettersByKey[key]) {
					this.prototypeExpression.deoptimizeThisOnEventAtPath(
						event,
						path,
						thisParameter,
						recursionTracker
					);
				}
			} else {
				for (const setters of Object.values(this.settersByKey).concat([this.unmatchableSetters])) {
					for (const setter of setters) {
						setter.deoptimizeThisOnEventAtPath(event, subPath, thisParameter, recursionTracker);
					}
				}
				if (this.prototypeExpression) {
					return this.prototypeExpression.deoptimizeThisOnEventAtPath(
						event,
						path,
						thisParameter,
						recursionTracker
					);
				}
			}
		}
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
					if (kind === 'set') unmatchableSetters.push(property)
					if (kind === 'get') unmatchableGetters.push(property)
					if (kind !== 'get') unmatchablePropertiesAndSetters.push(property)
					if (kind !== 'set') unmatchablePropertiesAndGetters.push(property)
				} else {
					if (kind === 'set') {
						if (!propertiesAndSettersByKey[key]) {
							propertiesAndSettersByKey[key] = [property, ...unmatchablePropertiesAndSetters]
							settersByKey[key] = [property, ...unmatchableSetters]
						}
					} else if (kind === 'get') {
						if (!propertiesAndGettersByKey[key]) {
							propertiesAndGettersByKey[key] = [property, ...unmatchablePropertiesAndGetters]
							gettersByKey[key] = [property, ...unmatchableGetters]
						}
					} else {
						if (!propertiesAndSettersByKey[key]) {
							propertiesAndSettersByKey[key] = [property, ...unmatchablePropertiesAndSetters]
						}
						if (!propertiesAndGettersByKey[key]) {
							propertiesAndGettersByKey[key] = [property, ...unmatchablePropertiesAndGetters]
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
