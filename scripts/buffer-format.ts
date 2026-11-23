import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import {
	astNodeNamesWithFieldOrder,
	BUFFER_FORMAT_VERSION,
	BUFFER_INVENTORY_FIELDS,
	SCOPE_NODE_FIELDS
} from './ast-types.ts';
import {
	ENCODED_PARENT_BIAS,
	getFirstFieldWordOffset,
	NODE_DATA_BYTES_AFTER_END,
	NODE_DATA_OFFSET,
	NODE_END_OFFSET,
	NODE_PARENT_OFFSET,
	NODE_START_OFFSET,
	NODE_TYPE_OFFSET,
	WORD_SIZE
} from './buffer-layout.ts';
import { STRING_CONSTANTS } from './string-constants.ts';

export type BufferFormatPart =
	'astNodes' | 'bufferInventory' | 'bufferLayout' | 'scopeNodes' | 'stringConstants';

export interface BufferFormat {
	fingerprints: Record<BufferFormatPart, string>;
	version: number;
}

export interface BufferFormatUpdate {
	failure: string | null;
}

export const bufferFormatFile = new URL('./buffer-format.json', import.meta.url);

// The declarative data that defines the buffer layout. Changing any of it
// requires increasing BUFFER_FORMAT_VERSION. Changes to the hand-written
// encoders, decoders and generator templates cannot be detected here and need
// to be reviewed.
const layoutData: Record<BufferFormatPart, unknown> = {
	astNodes: astNodeNamesWithFieldOrder,
	bufferInventory: BUFFER_INVENTORY_FIELDS,
	bufferLayout: {
		ENCODED_PARENT_BIAS,
		firstFieldWordOffsets: [getFirstFieldWordOffset(false), getFirstFieldWordOffset(true)],
		NODE_DATA_BYTES_AFTER_END,
		NODE_DATA_OFFSET,
		NODE_END_OFFSET,
		NODE_PARENT_OFFSET,
		NODE_START_OFFSET,
		NODE_TYPE_OFFSET,
		WORD_SIZE
	},
	scopeNodes: SCOPE_NODE_FIELDS,
	stringConstants: STRING_CONSTANTS
};

const getFingerprint = (data: unknown): string =>
	createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 16);

const getChangedParts = (previous: BufferFormat, current: BufferFormat): BufferFormatPart[] =>
	(Object.keys(current.fingerprints) as BufferFormatPart[]).filter(
		part => previous.fingerprints[part] !== current.fingerprints[part]
	);

export function getBufferFormat(): BufferFormat {
	const fingerprints = {} as Record<BufferFormatPart, string>;
	for (const [part, data] of Object.entries(layoutData)) {
		fingerprints[part as BufferFormatPart] = getFingerprint(data);
	}
	return { fingerprints, version: BUFFER_FORMAT_VERSION };
}

export async function readBufferFormat(
	file: URL | string = bufferFormatFile
): Promise<BufferFormat | null> {
	let content: string;
	try {
		content = await readFile(file, 'utf8');
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return null;
		}
		throw error;
	}
	return JSON.parse(content) as BufferFormat;
}

export function writeBufferFormat(format: BufferFormat): Promise<void> {
	return writeFile(bufferFormatFile, `${JSON.stringify(format, null, '\t')}\n`);
}

// Returns what the generator has to do with the committed file, or null if it
// is up to date: rewrite it, and fail once if a fingerprint changed so that
// neither the updated file nor the version bump can be skipped.
export function getBufferFormatUpdate(
	previous: BufferFormat | null,
	current: BufferFormat
): BufferFormatUpdate | null {
	if (!previous) {
		return {
			failure: 'The file scripts/buffer-format.json was missing and has been created. Commit it.'
		};
	}
	const changedParts = getChangedParts(previous, current);
	if (changedParts.length > 0) {
		return {
			failure: `The AST buffer layout changed (${changedParts.join(
				', '
			)}), and scripts/buffer-format.json has been updated. Commit the file and increase BUFFER_FORMAT_VERSION in scripts/ast-types.ts unless this pull request already did.`
		};
	}
	if (previous.version !== current.version) {
		return { failure: null };
	}
	return null;
}

export function assertVersionWasIncreased(previous: BufferFormat, current: BufferFormat): void {
	if (current.version < previous.version) {
		throw new Error(
			`BUFFER_FORMAT_VERSION was decreased from ${previous.version} to ${current.version}. Increase it in scripts/ast-types.ts to above ${previous.version}.`
		);
	}
	const changedParts = getChangedParts(previous, current);
	if (changedParts.length > 0 && current.version === previous.version) {
		throw new Error(
			`The AST buffer layout changed (${changedParts.join(
				', '
			)}) but BUFFER_FORMAT_VERSION was not increased. Increase it in scripts/ast-types.ts above ${previous.version}.`
		);
	}
}
