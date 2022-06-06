import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { HasEffectsContext } from '../../ExecutionContext';
import {
	INTERACTION_ACCESSED,
	INTERACTION_CALLED,
	NodeInteraction,
	NodeInteractionCalled,
	NodeInteractionWithThisArg
} from '../../NodeInteractions';
import {
	ObjectPath,
	ObjectPathKey,
	PathTracker,
	UNKNOWN_INTEGER_PATH,
	UNKNOWN_PATH,
	UnknownInteger,
	UnknownKey,
	UnknownNonAccessorKey
} from '../../utils/PathTracker';
import {
	ExpressionEntity,
	LiteralValueOrUnknown,
	UNKNOWN_EXPRESSION,
	UnknownTruthyValue,
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
	private hasLostTrack = false;
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

	deoptimizeAllProperties(noAccessors?: boolean): void {
		const isDeoptimized = this.hasLostTrack || this.hasUnknownDeoptimizedProperty;
		if (noAccessors) {
			this.hasUnknownDeoptimizedProperty = true;
		} else {
			this.hasLostTrack = true;
		}
		if (isDeoptimized) {
			return;
		}
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
		if (
			this.hasLostTrack ||
			this.hasUnknownDeoptimizedProperty ||
			this.hasUnknownDeoptimizedInteger
		) {
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

	// Assumption: If only a specific path is deoptimized, no accessors are created
	deoptimizePath(path: ObjectPath): void {
		if (this.hasLostTrack || this.immutable) {
			return;
		}
		const key = path[0];
		if (path.length === 1) {
			if (typeof key !== 'string') {
				if (key === UnknownInteger) {
					return this.deoptimizeIntegerProperties();
				}
				return this.deoptimizeAllProperties(key === UnknownNonAccessorKey);
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
		this.prototypeExpression?.deoptimizePath(path.length === 1 ? [...path, UnknownKey] : path);
	}

	deoptimizeThisOnInteractionAtPath(
		interaction: NodeInteractionWithThisArg,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		const [key, ...subPath] = path;

		if (
			this.hasLostTrack ||
			// single paths that are deoptimized will not become getters or setters
			((interaction.type === INTERACTION_CALLED || path.length > 1) &&
				(this.hasUnknownDeoptimizedProperty ||
					(typeof key === 'string' && this.deoptimizedPaths[key])))
		) {
			interaction.thisArg.deoptimizePath(UNKNOWN_PATH);
			return;
		}

		const [propertiesForExactMatchByKey, relevantPropertiesByKey, relevantUnmatchableProperties] =
			interaction.type === INTERACTION_CALLED || path.length > 1
				? [
						this.propertiesAndGettersByKey,
						this.propertiesAndGettersByKey,
						this.unmatchablePropertiesAndGetters
				  ]
				: interaction.type === INTERACTION_ACCESSED
				? [this.propertiesAndGettersByKey, this.gettersByKey, this.unmatchableGetters]
				: [this.propertiesAndSettersByKey, this.settersByKey, this.unmatchableSetters];

		if (typeof key === 'string') {
			if (propertiesForExactMatchByKey[key]) {
				const properties = relevantPropertiesByKey[key];
				if (properties) {
					for (const property of properties) {
						property.deoptimizeThisOnInteractionAtPath(interaction, subPath, recursionTracker);
					}
				}
				if (!this.immutable) {
					this.thisParametersToBeDeoptimized.add(interaction.thisArg);
				}
				return;
			}
			for (const property of relevantUnmatchableProperties) {
				property.deoptimizeThisOnInteractionAtPath(interaction, subPath, recursionTracker);
			}
			if (INTEGER_REG_EXP.test(key)) {
				for (const property of this.unknownIntegerProps) {
					property.deoptimizeThisOnInteractionAtPath(interaction, subPath, recursionTracker);
				}
			}
		} else {
			for (const properties of Object.values(relevantPropertiesByKey).concat([
				relevantUnmatchableProperties
			])) {
				for (const property of properties) {
					property.deoptimizeThisOnInteractionAtPath(interaction, subPath, recursionTracker);
				}
			}
			for (const property of this.unknownIntegerProps) {
				property.deoptimizeThisOnInteractionAtPath(interaction, subPath, recursionTracker);
			}
		}
		if (!this.immutable) {
			this.thisParametersToBeDeoptimized.add(interaction.thisArg);
		}
		this.prototypeExpression?.deoptimizeThisOnInteractionAtPath(
			interaction,
			path,
			recursionTracker
		);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (path.length === 0) {
			return UnknownTruthyValue;
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
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (path.length === 0) {
			return UNKNOWN_EXPRESSION;
		}
		const [key, ...subPath] = path;
		const expressionAtPath = this.getMemberExpressionAndTrackDeopt(key, origin);
		if (expressionAtPath) {
			return expressionAtPath.getReturnExpressionWhenCalledAtPath(
				subPath,
				interaction,
				recursionTracker,
				origin
			);
		}
		if (this.prototypeExpression) {
			return this.prototypeExpression.getReturnExpressionWhenCalledAtPath(
				path,
				interaction,
				recursionTracker,
				origin
			);
		}
		return UNKNOWN_EXPRESSION;
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		const [key, ...subPath] = path;
		if (subPath.length || interaction.type === INTERACTION_CALLED) {
			const expressionAtPath = this.getMemberExpression(key);
			if (expressionAtPath) {
				return expressionAtPath.hasEffectsOnInteractionAtPath(subPath, interaction, context);
			}
			if (this.prototypeExpression) {
				return this.prototypeExpression.hasEffectsOnInteractionAtPath(path, interaction, context);
			}
			return true;
		}
		if (key === UnknownNonAccessorKey) return false;
		if (this.hasLostTrack) return true;
		const [propertiesAndAccessorsByKey, accessorsByKey, unmatchableAccessors] =
			interaction.type === INTERACTION_ACCESSED
				? [this.propertiesAndGettersByKey, this.gettersByKey, this.unmatchableGetters]
				: [this.propertiesAndSettersByKey, this.settersByKey, this.unmatchableSetters];
		if (typeof key === 'string') {
			if (propertiesAndAccessorsByKey[key]) {
				const accessors = accessorsByKey[key];
				if (accessors) {
					for (const accessor of accessors) {
						if (accessor.hasEffectsOnInteractionAtPath(subPath, interaction, context)) return true;
					}
				}
				return false;
			}
			for (const accessor of unmatchableAccessors) {
				if (accessor.hasEffectsOnInteractionAtPath(subPath, interaction, context)) {
					return true;
				}
			}
		} else {
			for (const accessors of Object.values(accessorsByKey).concat([unmatchableAccessors])) {
				for (const accessor of accessors) {
					if (accessor.hasEffectsOnInteractionAtPath(subPath, interaction, context)) return true;
				}
			}
		}
		if (this.prototypeExpression) {
			return this.prototypeExpression.hasEffectsOnInteractionAtPath(path, interaction, context);
		}
		return false;
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
			this.hasLostTrack ||
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
