import type { LiteralValueOrUnknown } from '../nodes/shared/Expression';
import { UnknownFalsyValue, UnknownTruthyValue, UnknownValue } from '../nodes/shared/Expression';

export function tryCastLiteralValueToBoolean(
	literalValue: LiteralValueOrUnknown
): boolean | typeof UnknownValue {
	if (typeof literalValue === 'symbol') {
		if (literalValue === UnknownFalsyValue) {
			return false;
		}
		if (literalValue === UnknownTruthyValue) {
			return true;
		}
		return UnknownValue;
	}
	return !!literalValue;
}
