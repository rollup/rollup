import { parseAndWalk as parseAndWalkNative } from '../../native';
import { nodeIds } from '../ast/nodeIds';
import { nodeTypeStrings } from '../ast/nodeTypeStrings';
import type { ParseAndWalkApi, ParseAndWalkVisitors } from '../rollup/types';
import { deserializeLazyAstBuffer } from './bufferToLazyAst';
import type { AstBuffer } from './getAstBuffer';
import { getAstBuffer } from './getAstBuffer';
import {
	SCOPE_DECLARATION_COUNT_OFFSET,
	SCOPE_DECLARATIONS_OFFSET,
	SCOPE_PARENT_OFFSET
} from './scopeConstants';

const IDENTIFIER_NAME_OFFSET = 3;

export async function parseAndWalk(
	input: string,
	visitors: ParseAndWalkVisitors,
	{ allowReturnOutsideFunction = false, collectScopes = false, jsx = false } = {}
) {
	const selectedNodesBuffer = getSelectedNodesBitsetBuffer(visitors);

	const astBuffer = getAstBuffer(
		await parseAndWalkNative(
			input,
			allowReturnOutsideFunction,
			jsx,
			selectedNodesBuffer,
			collectScopes
		)
	);

	walkAstBuffer(astBuffer, visitors, collectScopes);
}

function getSelectedNodesBitsetBuffer(visitors: Record<string, unknown>): BigUint64Array {
	let selectedNodesBitset = 0n;

	for (const nodeType of Object.keys(visitors)) {
		const ids = nodeIds[nodeType];
		if (ids) {
			for (const id of ids) {
				selectedNodesBitset |= 1n << BigInt(id);
			}
		} else {
			throw new Error(`Unknown node type "${nodeType}" when calling "parseAndWalk".`);
		}
	}

	const selectedNodesBuffer = new BigUint64Array(2); // 2 × 64 bits = 128 bits
	selectedNodesBuffer[0] = selectedNodesBitset & ((1n << 64n) - 1n);
	selectedNodesBuffer[1] = selectedNodesBitset >> 64n;

	return selectedNodesBuffer;
}

// TODO Lukas Can we expose parseAndWalk as a separate method? Can we also make
//  sure to include its tests in the smoke tests to test on a big endian system?
function walkAstBuffer(
	astBuffer: AstBuffer,
	visitors: ParseAndWalkVisitors,
	collectScopes: boolean
) {
	const walkingInfoOffset = astBuffer[0];
	const entrySize = 3;

	// If it is 0, there are no walking buffer or walked nodes
	if (walkingInfoOffset === 0) {
		// This will throw the correct error if there was a parse error
		return deserializeLazyAstBuffer(astBuffer, 1) as never;
	}

	let walkingPosition = walkingInfoOffset;
	const scopeCache = new Map<number, NonNullable<ParseAndWalkApi['scope']>>();
	const api: ParseAndWalkApi = {
		parseChildren() {
			const endPosition = walkingInfoOffset + astBuffer[walkingPosition + 1] * entrySize;
			walkingPosition += entrySize;
			walkUntilPosition(endPosition);
			// After parseChildren, the walkingPosition must point to the last child,
			// not beyond. Otherwise, we would skip the next element.
			walkingPosition -= entrySize;
		},
		skipChildren() {
			// Like parseChildren, the pointer must point to the last child after
			// skipping, not beyond.
			walkingPosition = walkingInfoOffset + astBuffer[walkingPosition + 1] * entrySize - entrySize;
		}
	};

	function walkUntilPosition(endPosition: number) {
		for (; walkingPosition < endPosition; walkingPosition += entrySize) {
			const elementIndex = astBuffer[walkingPosition];
			if (collectScopes) {
				api.scope = getScope(astBuffer[walkingPosition + 2]);
			}
			const nodeTypeString = nodeTypeStrings[astBuffer[elementIndex]];
			visitors[nodeTypeString]!(deserializeLazyAstBuffer(astBuffer, elementIndex) as any, api);
		}
	}

	function getScope(scopePosition: number) {
		if (scopePosition === 0) {
			throw new Error('Internal Error: Missing scope information in parseAndWalk.');
		}
		let scope = scopeCache.get(scopePosition);
		if (!scope) {
			scope = {
				contains(name: string): boolean {
					for (let currentScopePosition = scopePosition; currentScopePosition; ) {
						const declarationCount =
							astBuffer[currentScopePosition + SCOPE_DECLARATION_COUNT_OFFSET];
						for (let index = 0; index < declarationCount; index++) {
							const identifierPosition =
								astBuffer[currentScopePosition + SCOPE_DECLARATIONS_OFFSET + index];
							if (
								astBuffer.convertString(astBuffer[identifierPosition + IDENTIFIER_NAME_OFFSET]) ===
								name
							) {
								return true;
							}
						}
						currentScopePosition = astBuffer[currentScopePosition + SCOPE_PARENT_OFFSET];
					}
					return false;
				}
			};
			scopeCache.set(scopePosition, scope);
		}
		return scope;
	}

	walkUntilPosition(astBuffer.length);
}
