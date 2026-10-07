import type { NodeInteraction } from '../../NodeInteractions';
import { INTERACTION_CALLED } from '../../NodeInteractions';
import {
	type ObjectPath,
	type ObjectPathKey,
	SymbolAsyncDispose,
	SymbolDispose
} from '../../utils/PathTracker';
import type { LiteralValueOrUnknown } from './Expression';
import { deoptimizeInteraction, ExpressionEntity, UnknownValue } from './Expression';
import {
	METHOD_RETURNS_BOOLEAN,
	METHOD_RETURNS_STRING,
	METHOD_RETURNS_UNKNOWN
} from './MethodTypes';
import { ObjectEntity } from './ObjectEntity';

const isKnownToBeMissing = (property: ObjectPathKey): boolean =>
	property === SymbolDispose ||
	property === SymbolAsyncDispose ||
	(typeof property === 'string' && /^\d+$/.test(property));

// This makes sure unknown properties are not handled as "undefined" but as
// "unknown" but without access side effects. An exception is done for numeric
// properties as we do not expect new builtin properties to be numbers, this
// will improve tree-shaking for out-of-bounds array properties. Disposal
// methods are also known to be missing so that "await using" can rely on the
// fallback to Symbol.dispose for plain objects.
const OBJECT_PROTOTYPE_FALLBACK: ExpressionEntity =
	new (class ObjectPrototypeFallbackExpression extends ExpressionEntity {
		deoptimizeArgumentsOnInteractionAtPath(interaction: NodeInteraction, path: ObjectPath): void {
			if (
				interaction.type === INTERACTION_CALLED &&
				path.length === 1 &&
				!isKnownToBeMissing(path[0])
			) {
				deoptimizeInteraction(interaction);
			}
		}

		getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
			return path.length === 1 && isKnownToBeMissing(path[0]) ? undefined : UnknownValue;
		}

		hasEffectsOnInteractionAtPath(path: ObjectPath, { type }: NodeInteraction): boolean {
			return path.length > 1 || type === INTERACTION_CALLED;
		}
	})();

export const OBJECT_PROTOTYPE = new ObjectEntity(
	new Map([
		['hasOwnProperty', METHOD_RETURNS_BOOLEAN],
		['isPrototypeOf', METHOD_RETURNS_BOOLEAN],
		['propertyIsEnumerable', METHOD_RETURNS_BOOLEAN],
		['toLocaleString', METHOD_RETURNS_STRING],
		['toString', METHOD_RETURNS_STRING],
		['valueOf', METHOD_RETURNS_UNKNOWN]
	]),
	OBJECT_PROTOTYPE_FALLBACK,
	true
);
