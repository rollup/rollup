import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import { INTERACTION_ACCESSED, INTERACTION_CALLED } from '../../NodeInteractions';
import type { EntityPathTracker, ObjectPath, ObjectPathKey } from '../../utils/PathTracker';
import {
	EMPTY_PATH,
	UNKNOWN_INTEGER_PATH,
	UNKNOWN_PATH,
	UnknownInteger,
	UnknownKey,
	UnknownNonAccessorKey
} from '../../utils/PathTracker';
import { Flag, isFlagSet, setFlag } from './BitFlags';
import type { LiteralValueOrUnknown } from './Expression';
import {
	deoptimizeInteraction,
	ExpressionEntity,
	UNKNOWN_EXPRESSION,
	UNKNOWN_RETURN_EXPRESSION,
	UnknownTruthyValue,
	UnknownValue
} from './Expression';
import type { IncludeChildren } from './Node';

export interface ObjectProperty {
	key: ObjectPathKey;
	kind: 'init' | 'set' | 'get';
	property: ExpressionEntity;
}

export type PropertyMap = Record<string, ExpressionEntity[]>;
const INTEGER_REG_EXP = /^\d+$/;

export class ObjectEntity extends ExpressionEntity {
	private get hasLostTrack(): boolean {
		return isFlagSet(this.flags, Flag.hasLostTrack);
	}
	private set hasLostTrack(value: boolean) {
		this.flags = setFlag(this.flags, Flag.hasLostTrack, value);
	}

	private get hasUnknownDeoptimizedInteger(): boolean {
		return isFlagSet(this.flags, Flag.hasUnknownDeoptimizedInteger);
	}
	private set hasUnknownDeoptimizedInteger(value: boolean) {
		this.flags = setFlag(this.flags, Flag.hasUnknownDeoptimizedInteger, value);
	}

	private get hasUnknownDeoptimizedProperty(): boolean {
		return isFlagSet(this.flags, Flag.hasUnknownDeoptimizedProperty);
	}
	private set hasUnknownDeoptimizedProperty(value: boolean) {
		this.flags = setFlag(this.flags, Flag.hasUnknownDeoptimizedProperty, value);
	}

	private readonly additionalExpressionsToBeDeoptimized = new Set<ExpressionEntity>();
	private readonly allProperties: ExpressionEntity[] = [];
	private readonly deoptimizedPaths: Record<string, boolean> = Object.create(null);
	private readonly expressionsToBeDeoptimizedByKey: Record<string, DeoptimizableEntity[]> =
		Object.create(null);
	private readonly gettersByKey: PropertyMap = Object.create(null);

	private readonly propertiesAndGettersByKey: PropertyMap = Object.create(null);
	private readonly propertiesAndSettersByKey: PropertyMap = Object.create(null);
	private readonly settersByKey: PropertyMap = Object.create(null);
	private readonly unknownIntegerProps: ExpressionEntity[] = [];
	private readonly unmatchableGetters: ExpressionEntity[] = [];
	private readonly unmatchablePropertiesAndGetters: ExpressionEntity[] = [];
	private readonly unmatchablePropertiesAndSetters: ExpressionEntity[] = [];
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
		for (const properties of [
			...Object.values(this.propertiesAndGettersByKey),
			...Object.values(this.settersByKey)
		]) {
			for (const property of properties) {
				property.deoptimizePath(UNKNOWN_PATH);
			}
		}
		// While the prototype itself cannot be mutated, each property can
		this.prototypeExpression?.deoptimizePath([UnknownKey, UnknownKey]);
		this.deoptimizeCachedEntities();
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	): void {
		const [key, ...subPath] = path;
		const { args, type } = interaction;

		if (
			this.hasLostTrack ||
			// single paths that are deoptimized will not become getters or setters
			((type === INTERACTION_CALLED || path.length > 1) &&
				(this.hasUnknownDeoptimizedProperty ||
					(typeof key === 'string' && this.deoptimizedPaths[key])))
		) {
			deoptimizeInteraction(interaction);
			return;
		}

		const [propertiesForExactMatchByKey, relevantPropertiesByKey, relevantUnmatchableProperties] =
			type === INTERACTION_CALLED || path.length > 1
				? [
						this.propertiesAndGettersByKey,
						this.propertiesAndGettersByKey,
						this.unmatchablePropertiesAndGetters
					]
				: type === INTERACTION_ACCESSED
					? [this.propertiesAndGettersByKey, this.gettersByKey, this.unmatchableGetters]
					: [this.propertiesAndSettersByKey, this.settersByKey, this.unmatchableSetters];

		if (typeof key === 'string') {
			if (propertiesForExactMatchByKey[key]) {
				const properties = relevantPropertiesByKey[key];
				if (properties) {
					for (const property of properties) {
						property.deoptimizeArgumentsOnInteractionAtPath(interaction, subPath, recursionTracker);
					}
				}
				if (!this.immutable) {
					for (const argument of args) {
						if (argument) {
							this.additionalExpressionsToBeDeoptimized.add(argument);
						}
					}
				}
				return;
			}
			for (const property of relevantUnmatchableProperties) {
				property.deoptimizeArgumentsOnInteractionAtPath(interaction, subPath, recursionTracker);
			}
			if (INTEGER_REG_EXP.test(key)) {
				for (const property of this.unknownIntegerProps) {
					property.deoptimizeArgumentsOnInteractionAtPath(interaction, subPath, recursionTracker);
				}
			}
		} else {
			for (const properties of [
				...Object.values(relevantPropertiesByKey),
				relevantUnmatchableProperties
			]) {
				for (const property of properties) {
					property.deoptimizeArgumentsOnInteractionAtPath(interaction, subPath, recursionTracker);
				}
			}
			for (const property of this.unknownIntegerProps) {
				property.deoptimizeArgumentsOnInteractionAtPath(interaction, subPath, recursionTracker);
			}
		}
		if (!this.immutable) {
			for (const argument of args) {
				if (argument) {
					this.additionalExpressionsToBeDeoptimized.add(argument);
				}
			}
		}
		this.prototypeExpression?.deoptimizeArgumentsOnInteractionAtPath(
			interaction,
			path,
			recursionTracker
		);
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
			if (key === UnknownInteger) {
				return this.deoptimizeIntegerProperties();
			} else if (typeof key !== 'string') {
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
			? [
					...(this.propertiesAndGettersByKey[key] || this.unmatchablePropertiesAndGetters),
					...(this.settersByKey[key] || this.unmatchableSetters)
				]
			: this.allProperties) {
			property.deoptimizePath(subPath);
		}
		this.prototypeExpression?.deoptimizePath(path.length === 1 ? [path[0], UnknownKey] : path);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: EntityPathTracker,
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
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		if (path.length === 0) {
			return UNKNOWN_RETURN_EXPRESSION;
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
		return UNKNOWN_RETURN_EXPRESSION;
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		const [key, ...subPath] = path;
		if (subPath.length > 0 || interaction.type === INTERACTION_CALLED) {
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
			for (const accessors of [...Object.values(accessorsByKey), unmatchableAccessors]) {
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

	includePath(
		path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	) {
		this.included = true;
		const [key, ...subPath] = path;
		if (key == null || includeChildrenRecursively) {
			for (const property of this.allProperties) {
				if (includeChildrenRecursively || property.shouldBeIncluded(context)) {
					property.includePath(EMPTY_PATH, context, includeChildrenRecursively);
				}
			}
			this.prototypeExpression?.includePath(EMPTY_PATH, context, includeChildrenRecursively);
		} else {
			const [includedMembers, includedPath] =
				typeof key === 'string'
					? [
							[
								...new Set([
									...(this.propertiesAndGettersByKey[key] || this.unmatchablePropertiesAndGetters),
									...(this.propertiesAndSettersByKey[key] || this.unmatchablePropertiesAndSetters)
								])
							],
							subPath
						]
					: [this.allProperties, UNKNOWN_PATH];
			for (const property of includedMembers) {
				property.includePath(includedPath, context, includeChildrenRecursively);
			}
			this.prototypeExpression?.includePath(path, context, includeChildrenRecursively);
		}
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
			unmatchablePropertiesAndSetters,
			unmatchableGetters,
			unmatchableSetters
		} = this;
		for (let index = properties.length - 1; index >= 0; index--) {
			const { key, kind, property } = properties[index];
			allProperties.push(property);
			if (typeof key === 'string') {
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
			} else {
				if (key === UnknownInteger) {
					unknownIntegerProps.push(property);
					continue;
				}
				if (kind === 'set') unmatchableSetters.push(property);
				if (kind === 'get') unmatchableGetters.push(property);
				if (kind !== 'get') unmatchablePropertiesAndSetters.push(property);
				if (kind !== 'set') unmatchablePropertiesAndGetters.push(property);
			}
		}
	}

	private deoptimizeCachedEntities() {
		for (const expressionsToBeDeoptimized of Object.values(this.expressionsToBeDeoptimizedByKey)) {
			for (const expression of expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
		}
		for (const expression of this.additionalExpressionsToBeDeoptimized) {
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
		for (const expression of this.additionalExpressionsToBeDeoptimized) {
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
			(this.unknownIntegerProps.length > 0 && INTEGER_REG_EXP.test(key))
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
