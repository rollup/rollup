import { parseAndWalk as parseAndWalkNative } from '../../native';
import { nodeIds } from '../ast/nodeIds';
import { nodeTypeStrings } from '../ast/nodeTypeStrings';
import type { ParseAndWalkApi, ParseAndWalkVisitors } from '../rollup/types';
import { deserializeLazyAstBuffer } from './bufferToLazyAst';
import type { AstBuffer } from './getAstBuffer';
import { getAstBuffer } from './getAstBuffer';

export async function parseAndWalk(
	input: string,
	visitors: ParseAndWalkVisitors,
	{ allowReturnOutsideFunction = false, jsx = false } = {}
) {
	const selectedNodesBuffer = getSelectedNodesBitsetBuffer(visitors);

	const astBuffer = getAstBuffer(
		await parseAndWalkNative(input, allowReturnOutsideFunction, jsx, selectedNodesBuffer)
	);

	walkAstBuffer(astBuffer, visitors);
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
function walkAstBuffer(astBuffer: AstBuffer, visitors: ParseAndWalkVisitors) {
	const walkingInfoOffset = astBuffer[0];

	// If it is 0, there are no walking buffer or walked nodes
	if (walkingInfoOffset === 0) {
		// This will throw the correct error if there was a parse error
		return deserializeLazyAstBuffer(astBuffer, 1) as never;
	}

	let walkingPosition = walkingInfoOffset;
	const api: ParseAndWalkApi = {
		parseChildren() {
			const endPosition = walkingInfoOffset + (astBuffer[walkingPosition + 1] << 1);
			walkingPosition += 2;
			walkUntilPosition(endPosition);
			// After parseChildren, the walkingPosition must point to the last child,
			// not beyond. Otherwise, we would skip the next element.
			walkingPosition -= 2;
		},
		skipChildren() {
			// Like parseChildren, the pointer must point to the last child after
			// skipping, not beyond.
			walkingPosition = walkingInfoOffset + (astBuffer[walkingPosition + 1] << 1) - 2;
		}
	};

	function walkUntilPosition(endPosition: number) {
		for (; walkingPosition < endPosition; walkingPosition += 2) {
			const elementIndex = astBuffer[walkingPosition];
			const nodeTypeString = nodeTypeStrings[astBuffer[elementIndex]];
			visitors[nodeTypeString]!(deserializeLazyAstBuffer(astBuffer, elementIndex) as any, api);
		}
	}

	walkUntilPosition(astBuffer.length);
}
