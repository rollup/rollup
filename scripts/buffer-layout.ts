export const WORD_SIZE = 4;
export const NODE_TYPE_OFFSET = 0;
export const NODE_PARENT_OFFSET = 1;
export const NODE_START_OFFSET = 2;
export const NODE_END_OFFSET = 3;
export const NODE_DATA_OFFSET = 4;
export const NODE_DATA_BYTES_AFTER_END = (NODE_DATA_OFFSET - NODE_END_OFFSET) * WORD_SIZE;
export const ENCODED_PARENT_BIAS = 1;
export const getFirstFieldWordOffset = (hasFlags: boolean): number =>
	NODE_DATA_OFFSET + (hasFlags ? 1 : 0);
