import { parseAndWalk as parseAndWalkNative } from '../../native';
import { nodeIds } from '../ast/nodeIds';
import type {
	CodeEditor,
	ParseAndWalk,
	ParseAndWalkApi,
	ParseAndWalkHandler,
	ParseAndWalkOptions,
	ParseAndWalkVisitors
} from '../rollup/types';
import { getAstPosition, getWalkingInfo } from './bufferInventory';
import { convertNode, deserializeLazyAstBuffer, IDENTIFIER_NAME_OFFSET } from './bufferToLazyAst';
import { createCodeEditor } from './codeEditor';
import type { AstBuffer } from './getAstBuffer';
import { getAstBuffer } from './getAstBuffer';
import {
	SCOPE_DECLARATION_COUNT_OFFSET,
	SCOPE_DECLARATIONS_OFFSET,
	SCOPE_PARENT_OFFSET
} from './scopeConstants';

type ParseAndWalkOptionsWithCodeEditor = ParseAndWalkOptions & { codeEditor?: boolean };

export const parseAndWalk = (async (
	input: string,
	visitors: ParseAndWalkVisitors,
	options: ParseAndWalkOptionsWithCodeEditor = {}
) => {
	const {
		allowReturnOutsideFunction = false,
		codeEditor = false,
		collectScopes = false,
		jsx = false
	} = options;
	const selectedNodesBuffer = getSelectedNodesBitsetBuffer(visitors);

	const astBuffer = getAstBuffer(
		await parseAndWalkNative(
			input,
			allowReturnOutsideFunction,
			jsx,
			selectedNodesBuffer,
			collectScopes,
			codeEditor
		)
	);
	const walkingInfo = getWalkingInfo(astBuffer);
	if (!walkingInfo) {
		// Without walking info, the buffer contains a parse error
		return deserializeLazyAstBuffer(astBuffer, getAstPosition(astBuffer)) as never;
	}
	const codeEditorInstance = codeEditor ? createCodeEditor(input, astBuffer) : undefined;
	walkAstBuffer(astBuffer, walkingInfo, visitors, collectScopes, codeEditorInstance);
	return codeEditorInstance ? { codeEditor: codeEditorInstance } : undefined;
}) as ParseAndWalk;

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
	walkingInfo: Uint32Array,
	visitors: ParseAndWalkVisitors,
	collectScopes: boolean,
	codeEditor: CodeEditor | undefined
) {
	const entrySize = 3;

	let walkingPosition = 0;
	const scopeCache = new Map<number, NonNullable<ParseAndWalkApi['scope']>>();
	const nodeVisitors: ParseAndWalkHandler[] = [];
	for (const [nodeType, visitor] of Object.entries(visitors)) {
		for (const id of nodeIds[nodeType]) {
			nodeVisitors[id] = visitor as ParseAndWalkHandler;
		}
	}
	const api: ParseAndWalkApi = {
		codeEditor,
		parseChildren() {
			const endPosition = walkingInfo[walkingPosition + 1] * entrySize;
			walkingPosition += entrySize;
			walkUntilPosition(endPosition);
			// After parseChildren, the walkingPosition must point to the last child,
			// not beyond. Otherwise, we would skip the next element.
			walkingPosition -= entrySize;
		},
		skipChildren() {
			// Like parseChildren, the pointer must point to the last child after
			// skipping, not beyond.
			walkingPosition = walkingInfo[walkingPosition + 1] * entrySize - entrySize;
		}
	};

	function walkUntilPosition(endPosition: number) {
		for (; walkingPosition < endPosition; walkingPosition += entrySize) {
			const nodePosition = walkingInfo[walkingPosition];
			if (collectScopes) {
				api.scope = getScope(walkingInfo[walkingPosition + 2]);
			}
			nodeVisitors[astBuffer[nodePosition]]!(convertNode(nodePosition, astBuffer), api);
		}
	}

	function getScope(scopePosition: number) {
		/* istanbul ignore next */
		if (scopePosition === 0) {
			throw new Error('Internal Error: Missing scope information in parseAndWalk.');
		}
		let scope = scopeCache.get(scopePosition);
		if (!scope) {
			scope = {
				contains(name: string): boolean {
					for (let currentScopePosition = scopePosition; currentScopePosition;) {
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

	walkUntilPosition(walkingInfo.length);
}
