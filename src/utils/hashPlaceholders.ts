import type Chunk from '../Chunk';

// Four random characters from the private use area to minimize risk of conflicts
const hashPlaceholderLeft = '\uf7f9\ue4d3';
const hashPlaceholderRight = '\ue3cc\uf1fe';
const hashPlaceholderOverhead = hashPlaceholderLeft.length + hashPlaceholderRight.length;

// This is the size of a sha256
const maxHashSize = 64;
const minHashSize = hashPlaceholderOverhead + 1;
export const defaultHashSize = 8;

export type HashPlaceholderGenerator = (chunk: Chunk, hashSize?: number) => string;

// TODO Lukas throw for maximum hash size exceeded
// TODO Lukas make hash size configurable via [hash:hashLength] and configure it per hash
export const getHashPlaceholderGenerator = (): {
	chunksByPlaceholder: Map<string, Chunk>;
	getHashPlaceholder: HashPlaceholderGenerator;
} => {
	const chunksByPlaceholder = new Map<string, Chunk>();
	let nextIndex = 0;
	return {
		chunksByPlaceholder,
		getHashPlaceholder: (chunk: Chunk, hashSize: number = defaultHashSize) => {
			const placeholder = `${hashPlaceholderLeft}${String(++nextIndex).padStart(
				hashSize - hashPlaceholderOverhead,
				'0'
			)}${hashPlaceholderRight}`;
			if (placeholder.length > hashSize) {
				// TODO Lukas add proper error code and props
				// TODO Lukas test
				throw new Error(
					`To generate hashes for this number of chunks (currently ${nextIndex}), you need a minimum hash size of ${placeholder.length}.`
				);
			}
			chunksByPlaceholder.set(placeholder, chunk);
			nextIndex++;
			return placeholder;
		}
	};
};

const REPLACER_REGEX = new RegExp(
	`${hashPlaceholderLeft}\\d{${minHashSize - hashPlaceholderOverhead},${
		maxHashSize - hashPlaceholderOverhead
	}}${hashPlaceholderRight}`,
	'g'
);

export const replacePlaceholders = (
	code: string,
	hashesByPlaceholder: Map<string, string>
): string =>
	code.replace(REPLACER_REGEX, placeholder => hashesByPlaceholder.get(placeholder) || placeholder);

export const replaceSinglePlaceholder = (
	code: string,
	placeholder: string,
	value: string
): string => code.replace(REPLACER_REGEX, match => (match === placeholder ? value : match));

// TODO Lukas test random match
export const replacePlaceholdersWithDefaultAndGetContainedPlaceholders = (
	code: string,
	placeholders: Map<string, Chunk>
): { containedPlaceholders: Set<string>; transformedCode: string } => {
	const containedPlaceholders = new Set<string>();
	const transformedCode = code.replace(REPLACER_REGEX, placeholder => {
		if (placeholders.has(placeholder)) {
			containedPlaceholders.add(placeholder);
			return `${hashPlaceholderLeft}${'0'.repeat(
				placeholder.length - hashPlaceholderOverhead
			)}${hashPlaceholderRight}`;
		}
		return placeholder;
	});
	return { containedPlaceholders, transformedCode };
};
