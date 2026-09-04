import { getOrCreate } from '../../utils/getOrCreate';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { NodeInteractionCalled } from '../NodeInteractions';
import { type ExpressionEntity, UNKNOWN_RETURN_EXPRESSION } from '../nodes/shared/Expression';
import type { ObjectPath } from './PathTracker';

/**
 * Per query memoization for getReturnExpressionWhenCalledAtPath to avoid
 * exponential performance and memory impact when using recursive structures
 * with many returns and conditionals expressions.
 *
 * The compositions state is forwarded through
 * getReturnExpressionWhenCalledAtPath as a parameter. A null state means "not
 * inside a memoized composition"; memoizeReturnComposition then creates a
 * fresh state and hands it to the computation. Entries are grouped by owner
 * and matched by path, interaction and origin and are only considered while the
 * "epoch" they were computed in is still current.
 *
 * Whenever a deoptimization happens, the epoch is changed.
 */

type ComposedReturn = [expression: ExpressionEntity, isPure: boolean];

interface CompositionEntry {
	readonly path: ObjectPath;
	readonly interaction: NodeInteractionCalled;
	readonly origin: DeoptimizableEntity;
	// null while the composition is still being computed
	result: ComposedReturn | null;
}

export interface ReturnCompositionState {
	readonly memo: Map<ExpressionEntity, CompositionEntry[]>;
	// the compositionEpoch the existing entries were last validated against
	epoch: number;
	truncatedCycles: number;
}

let compositionEpoch = 0;

/**
 * Must be called by any getReturnExpressionWhenCalledAtPath implementation
 * that deoptimizes expressions. The epoch is global state because rollup
 * deliberately computes persistent caches like the return expression of a call
 * in fresh recursion contexts, which can trigger such deoptimizations while
 * other states are still live; they must invalidate the entries of every live
 * state.
 */
export function invalidateComposedReturns(): void {
	compositionEpoch++;
}

function createReturnCompositionState(): ReturnCompositionState {
	return { epoch: compositionEpoch, memo: new Map(), truncatedCycles: 0 };
}

function pathsAreEqual(first: ObjectPath, second: ObjectPath): boolean {
	if (first === second) return true;
	if (first.length !== second.length) return false;
	for (let index = 0; index < first.length; index++) {
		if (first[index] !== second[index]) return false;
	}
	return true;
}

function dropStaleEntries(state: ReturnCompositionState): void {
	if (state.epoch === compositionEpoch) return;
	// Entries computed before a deoptimization must not be served, but the
	// pending entries of in-flight frames are control state that cuts cycles
	// and must survive.
	for (const entries of state.memo.values()) {
		for (let index = entries.length - 1; index >= 0; index--) {
			if (entries[index].result) entries.splice(index, 1);
		}
	}
	state.epoch = compositionEpoch;
}

export function memoizeReturnComposition(
	compositionState: ReturnCompositionState | null,
	owner: ExpressionEntity,
	path: ObjectPath,
	interaction: NodeInteractionCalled,
	origin: DeoptimizableEntity,
	computeComposition: (state: ReturnCompositionState) => ComposedReturn
): ComposedReturn {
	const state = compositionState ?? createReturnCompositionState();
	dropStaleEntries(state);
	const entries = getOrCreate(state.memo, owner, () => []);
	for (const entry of entries) {
		if (
			entry.interaction === interaction &&
			entry.origin === origin &&
			pathsAreEqual(entry.path, path)
		) {
			if (entry.result) return entry.result;
			// This is a cycle back into a composition that is still being computed
			// further up the stack. Answer with unknown to end the cycle.
			state.truncatedCycles++;
			return UNKNOWN_RETURN_EXPRESSION;
		}
	}

	const entry: CompositionEntry = { interaction, origin, path, result: null };
	entries.push(entry);
	const epochAtStart = compositionEpoch;
	const truncatedCyclesAtStart = state.truncatedCycles;
	const result = computeComposition(state);
	if (epochAtStart === compositionEpoch && truncatedCyclesAtStart === state.truncatedCycles) {
		entry.result = result;
	} else {
		removeEntry(entries, entry);
	}
	return result;
}

function removeEntry(entries: CompositionEntry[], entry: CompositionEntry): void {
	const index = entries.indexOf(entry);
	if (index >= 0) entries.splice(index, 1);
}
