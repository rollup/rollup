import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext } from '../ExecutionContext';
import { ExpressionEntity } from '../nodes/shared/Expression';
import { UNKNOWN_EXPRESSION } from '../values';
import { ObjectPath, ObjectPathKey, UnknownKey, UNKNOWN_PATH } from './PathTracker';

export interface ObjectProperty {
	key: ObjectPathKey;
	kind: 'init' | 'set' | 'get';
	property: ExpressionEntity;
}

type PropertyMap = Record<string, ExpressionEntity[]>;

export type ObjectPathHandler = ReturnType<typeof getObjectPathHandler>;

export function getObjectPathHandler(properties: ObjectProperty[]) {
	const {
		allProperties,
		propertiesByKey,
		gettersByKey,
		settersByKey,
		unmatchableGetters,
		unmatchableProperties,
		unmatchableSetters
	} = getPropertyMaps(properties);

	let hasUnknownDeoptimizedProperty = false;
	const deoptimizedPaths = new Set<string>();
	const expressionsToBeDeoptimizedByKey: Record<string, DeoptimizableEntity[]> = Object.create(
		null
	);

	// TODO Lukas it would be really interesting to know if we have any getters here?
	// -> Add a third table of getters here!
	function getMemberExpression(key: ObjectPathKey): ExpressionEntity | null {
		if (hasUnknownDeoptimizedProperty || typeof key !== 'string' || deoptimizedPaths.has(key)) {
			return UNKNOWN_EXPRESSION;
		}
		if (propertiesByKey[key]?.length === 1) {
			return propertiesByKey[key][0];
		}
		if (propertiesByKey[key] || unmatchableProperties.length > 0) {
			return UNKNOWN_EXPRESSION;
		}
		return null;
	}

	function getMemberExpressionAndTrackDeopt(
		key: ObjectPathKey,
		origin: DeoptimizableEntity
	): ExpressionEntity | null {
		if (key === UnknownKey) {
			return UNKNOWN_EXPRESSION;
		}
		const expression = getMemberExpression(key);
		if (expression !== UNKNOWN_EXPRESSION) {
			const expressionsToBeDeoptimized = (expressionsToBeDeoptimizedByKey[key] =
				expressionsToBeDeoptimizedByKey[key] || []);
			expressionsToBeDeoptimized.push(origin);
		}
		return expression;
	}

	function hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		const [key, ...subPath] = path;
		if (path.length > 1) {
			const expressionAtPath = getMemberExpression(key);
			return !expressionAtPath || expressionAtPath.hasEffectsWhenAccessedAtPath(subPath, context);
		}

		if (typeof key !== 'string') return true;

		const properties = gettersByKey[key] || unmatchableGetters;
		for (const property of properties) {
			if (property.hasEffectsWhenAccessedAtPath(subPath, context)) return true;
		}
		return false;
	}

	function hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		const [key, ...subPath] = path;
		if (path.length > 1) {
			const expressionAtPath = getMemberExpression(key);
			return !expressionAtPath || expressionAtPath.hasEffectsWhenAssignedAtPath(subPath, context);
		}

		if (typeof key !== 'string') return true;

		const properties = settersByKey[key] || unmatchableSetters;
		for (const property of properties) {
			if (property.hasEffectsWhenAssignedAtPath(subPath, context)) return true;
		}
		return false;
	}

	function deoptimizePath(path: ObjectPath) {
		if (hasUnknownDeoptimizedProperty) return;
		const key = path[0];
		if (path.length === 1) {
			if (typeof key !== 'string') {
				deoptimizeAllProperties();
				return;
			}
			if (!deoptimizedPaths.has(key)) {
				deoptimizedPaths.add(key);

				// we only deoptimizeCache exact matches as in all other cases,
				// we do not return a literal value or return expression
				const expressionsToBeDeoptimized = expressionsToBeDeoptimizedByKey[key];
				if (expressionsToBeDeoptimized) {
					for (const expression of expressionsToBeDeoptimized) {
						expression.deoptimizeCache();
					}
				}
			}
		}
		const subPath = path.length === 1 ? UNKNOWN_PATH : path.slice(1);

		for (const property of typeof key === 'string'
			? (propertiesByKey[key] || unmatchableProperties).concat(
					settersByKey[key] || unmatchableSetters
			  )
			: allProperties) {
			property.deoptimizePath(subPath);
		}
	}

	function deoptimizeAllProperties() {
		if (hasUnknownDeoptimizedProperty) return;
		hasUnknownDeoptimizedProperty = true;
		for (const property of allProperties) {
			property.deoptimizePath(UNKNOWN_PATH);
		}
		for (const expressionsToBeDeoptimized of Object.values(expressionsToBeDeoptimizedByKey)) {
			for (const expression of expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
		}
	}

	return {
		deoptimizeAllProperties,
		deoptimizePath,
		getMemberExpression,
		getMemberExpressionAndTrackDeopt,
		hasEffectsWhenAccessedAtPath,
		hasEffectsWhenAssignedAtPath
	};
}

function getPropertyMaps(
	properties: ObjectProperty[]
): {
	allProperties: ExpressionEntity[];
	gettersByKey: Record<string, ExpressionEntity[]>;
	propertiesByKey: Record<string, ExpressionEntity[]>;
	settersByKey: Record<string, ExpressionEntity[]>;
	unmatchableGetters: ExpressionEntity[];
	unmatchableProperties: ExpressionEntity[];
	unmatchableSetters: ExpressionEntity[];
} {
	const allProperties = [];
	const propertiesByKey: PropertyMap = Object.create(null);
	const settersByKey: PropertyMap = Object.create(null);
	const gettersByKey: PropertyMap = Object.create(null);
	const unmatchableProperties: ExpressionEntity[] = [];
	const unmatchableSetters: ExpressionEntity[] = [];
	const unmatchableGetters: ExpressionEntity[] = [];
	for (let index = properties.length - 1; index >= 0; index--) {
		const { key, kind, property } = properties[index];
		allProperties.push(property);
		if (kind === 'set') {
			if (typeof key !== 'string') {
				unmatchableSetters.push(property);
			} else if (!settersByKey[key]) {
				settersByKey[key] = [property, ...unmatchableSetters];
			}
		} else {
			if (typeof key !== 'string') {
				unmatchableProperties.push(property);
				if (kind === 'get') {
					unmatchableGetters.push(property);
				}
			} else if (!propertiesByKey[key]) {
				propertiesByKey[key] = [property, ...unmatchableProperties];
				gettersByKey[key] = [...unmatchableGetters];
				if (kind === 'get') {
					gettersByKey[key].push(property);
				}
			}
		}
	}
	return {
		allProperties,
		gettersByKey,
		propertiesByKey,
		settersByKey,
		unmatchableGetters,
		unmatchableProperties,
		unmatchableSetters
	};
}
