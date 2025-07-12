import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { EntityPathTracker, ObjectPath } from '../../utils/PathTracker';
import { EMPTY_PATH, SHARED_RECURSION_TRACKER } from '../../utils/PathTracker';
import type CallExpression from '../CallExpression';
import type MemberExpression from '../MemberExpression';
import type * as nodes from '../node-unions';
import type Super from '../Super';
import type { LiteralValueOrUnknown } from './Expression';
import type { SkippedChain } from './Node';
import { IS_SKIPPED_CHAIN } from './Node';

export function getChainElementLiteralValueAtPath(
	element: CallExpression | MemberExpression,
	object: nodes.Expression | Super,
	path: ObjectPath,
	recursionTracker: EntityPathTracker,
	origin: DeoptimizableEntity
): LiteralValueOrUnknown | SkippedChain {
	if ('getLiteralValueAtPathAsChainElement' in object) {
		const calleeValue = object.getLiteralValueAtPathAsChainElement(
			EMPTY_PATH,
			SHARED_RECURSION_TRACKER,
			origin
		);
		if (calleeValue === IS_SKIPPED_CHAIN || (element.optional && calleeValue == null)) {
			return IS_SKIPPED_CHAIN;
		}
	} else if (
		element.optional &&
		object.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, origin) == null
	) {
		return IS_SKIPPED_CHAIN;
	}
	return element.getLiteralValueAtPath(path, recursionTracker, origin);
}
