import { nodeIds } from '../ast/nodeIds';
import { nodeTypeStrings } from '../ast/nodeTypeStrings';
import type { ParseAndWalkVisitors } from '../rollup/types';
import { deserializeLazyAstBuffer } from './bufferToAst';
import type { AstBuffer } from './getAstBuffer';

export function getSelectedNodesBitsetBuffer(
	visitors: Record<string, unknown>,
	pluginName: string
): BigUint64Array {
	let selectedNodesBitset = 0n;

	for (const nodeType of Object.keys(visitors)) {
		const ids = nodeIds[nodeType];
		if (ids) {
			for (const id of ids) {
				selectedNodesBitset |= 1n << BigInt(id);
			}
		} else {
			throw new Error(
				`Unknown node type "${nodeType}" when calling "parseAndWalk" in plugin "${pluginName}".`
			);
		}
	}

	const selectedNodesBuffer = new BigUint64Array(2); // 2 × 64 bits = 128 bits
	selectedNodesBuffer[0] = selectedNodesBitset & ((1n << 64n) - 1n);
	selectedNodesBuffer[1] = selectedNodesBitset >> 64n;

	return selectedNodesBuffer;
}

// TODO Lukas verify offsets in the walking info are native endian
export function walkAstBuffer(astBuffer: AstBuffer, visitors: ParseAndWalkVisitors) {
	const walkingInfoOffset = astBuffer[0];

	// If it is 0, there are no walking buffer and no walked nodes
	if (walkingInfoOffset === 0) {
		// This will throw the correct error if there was a parse error
		deserializeLazyAstBuffer(astBuffer, 1);
		return;
	}

	for (
		let walkingPosition = walkingInfoOffset;
		walkingPosition < astBuffer.length;
		walkingPosition += 2
	) {
		const elementIndex = astBuffer[walkingPosition];
		const nodeTypeString = nodeTypeStrings[astBuffer[elementIndex]];
		visitors[nodeTypeString]!(deserializeLazyAstBuffer(astBuffer, elementIndex) as any, {
			parseChildren() {},
			skipChildren() {}
		});
	}
}
