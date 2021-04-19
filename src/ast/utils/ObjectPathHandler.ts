import { getOrCreate } from '../../utils/getOrCreate';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext } from '../ExecutionContext';
import { ExpressionEntity } from '../nodes/shared/Expression';
import { UNKNOWN_EXPRESSION } from '../values';
import { ObjectPath, ObjectPathKey, UNKNOWN_PATH } from './PathTracker';

// TODO Lukas simplify
// TODO Lukas maybe an "intermediate format" that just contains objects {kind, key, prop}[], __proto__ could be an unshift {kind: "prop", key: UnknownKey, prop: UNKNOWN_EXPRESSION}?
// TODO Lukas propertiesWrite is currently actually "setters"; maybe it makes sense to also distinguish "getters" for easier access checking?
export interface PropertyMap {
	[key: string]: {
		exactMatchRead: ExpressionEntity | null;
		exactMatchWrite: ExpressionEntity | null;
		propertiesRead: ExpressionEntity[];
		propertiesWrite: ExpressionEntity[];
	};
}

export type ObjectPathHandler = ReturnType<typeof getObjectPathHandler>;

// TODO Lukas use an object for expressionsToBeDeoptimizedByKey for better performance
export function getObjectPathHandler(
	propertyMap: PropertyMap,
	// TODO Lukas unify naming: ..forAssignment?
	unmatchablePropertiesRead: ExpressionEntity[],
	unmatchablePropertiesWrite: ExpressionEntity[],
	allProperties: ExpressionEntity[],
	expressionsToBeDeoptimizedByKey: Map<string, DeoptimizableEntity[]>
) {
	let hasUnknownDeoptimizedProperty = false;
	const deoptimizedPaths = new Set<string>();

	function getMemberExpression(key: ObjectPathKey): ExpressionEntity | null {
		if (hasUnknownDeoptimizedProperty || typeof key !== 'string' || deoptimizedPaths.has(key)) {
			return UNKNOWN_EXPRESSION;
		}

		if (
			propertyMap[key] &&
			propertyMap[key].exactMatchRead &&
			propertyMap[key].propertiesRead.length === 1
		) {
			return propertyMap[key].exactMatchRead!;
		}

		if (propertyMap[key] || unmatchablePropertiesRead.length > 0) {
			return UNKNOWN_EXPRESSION;
		}

		return null;
	}

	function getMemberExpressionAndTrackDeopt(
		key: ObjectPathKey,
		origin: DeoptimizableEntity
	): ExpressionEntity | null {
		const expression = getMemberExpression(key);
		if (expression !== UNKNOWN_EXPRESSION) {
			getOrCreate(expressionsToBeDeoptimizedByKey, key, () => []).push(origin);
		}
		return expression;
	}

	function hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		const [key, ...subPath] = path;
		if (path.length > 1) {
			const expressionAtPath = getMemberExpression(key);
			return !expressionAtPath || expressionAtPath.hasEffectsWhenAssignedAtPath(subPath, context);
		}

		if (typeof key !== 'string') return true;

		const properties = propertyMap[key]?.exactMatchWrite
			? propertyMap[key].propertiesWrite
			: unmatchablePropertiesWrite;
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
				const expressionsToBeDeoptimized = expressionsToBeDeoptimizedByKey.get(key);
				if (expressionsToBeDeoptimized) {
					for (const expression of expressionsToBeDeoptimized) {
						expression.deoptimizeCache();
					}
				}
			}
		}
		const subPath = path.length === 1 ? UNKNOWN_PATH : path.slice(1);
		for (const property of typeof key === 'string'
			? propertyMap[key]
				? propertyMap[key].propertiesRead.concat(propertyMap[key].propertiesWrite)
				: []
			: allProperties) {
			property.deoptimizePath(subPath);
		}
	}

	function deoptimizeAllProperties() {
		hasUnknownDeoptimizedProperty = true;
		for (const property of allProperties) {
			property.deoptimizePath(UNKNOWN_PATH);
		}
		for (const expressionsToBeDeoptimized of expressionsToBeDeoptimizedByKey.values()) {
			for (const expression of expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
		}
	}

	function deoptimizeCache() {
		if (hasUnknownDeoptimizedProperty) return;
		deoptimizeAllProperties();
	}

	return {
		deoptimizeCache,
		deoptimizePath,
		getMemberExpression,
		getMemberExpressionAndTrackDeopt,
		hasEffectsWhenAssignedAtPath
	};
}
