import {
	INTERACTION_CALLED,
	NodeInteraction,
	NodeInteractionWithThisArg
} from '../../NodeInteractions';
import { ObjectPath, ObjectPathKey, UNKNOWN_PATH } from '../../utils/PathTracker';
import { ExpressionEntity, LiteralValueOrUnknown, UnknownValue } from './Expression';
import {
	METHOD_RETURNS_BOOLEAN,
	METHOD_RETURNS_STRING,
	METHOD_RETURNS_UNKNOWN
} from './MethodTypes';
import { ObjectEntity, type PropertyMap } from './ObjectEntity';

const isInteger = (prop: ObjectPathKey): boolean => typeof prop === 'string' && /^\d+$/.test(prop);

// This makes sure unknown properties are not handled as "undefined" but as
// "unknown" but without access side effects. An exception is done for numeric
// properties as we do not expect new builtin properties to be numbers, this
// will improve tree-shaking for out-of-bounds array properties
const OBJECT_PROTOTYPE_FALLBACK: ExpressionEntity =
	new (class ObjectPrototypeFallbackExpression extends ExpressionEntity {
		deoptimizeThisOnInteractionAtPath(
			{ type, thisArg }: NodeInteractionWithThisArg,
			path: ObjectPath
		): void {
			if (type === INTERACTION_CALLED && path.length === 1 && !isInteger(path[0])) {
				thisArg.deoptimizePath(UNKNOWN_PATH);
			}
		}

		getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
			// We ignore number properties as we do not expect new properties to be
			// numbers and also want to keep handling out-of-bound array elements as
			// "undefined"
			return path.length === 1 && isInteger(path[0]) ? undefined : UnknownValue;
		}

		hasEffectsOnInteractionAtPath(path: ObjectPath, { type }: NodeInteraction): boolean {
			return path.length > 1 || type === INTERACTION_CALLED;
		}
	})();

export const OBJECT_PROTOTYPE = new ObjectEntity(
	{
		__proto__: null,
		hasOwnProperty: METHOD_RETURNS_BOOLEAN,
		isPrototypeOf: METHOD_RETURNS_BOOLEAN,
		propertyIsEnumerable: METHOD_RETURNS_BOOLEAN,
		toLocaleString: METHOD_RETURNS_STRING,
		toString: METHOD_RETURNS_STRING,
		valueOf: METHOD_RETURNS_UNKNOWN
	} as unknown as PropertyMap,
	OBJECT_PROTOTYPE_FALLBACK,
	true
);
