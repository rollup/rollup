// Four random characters from the private use area to minimize risk of conflicts
const hashPlaceholderLeft = '\uf7f9\ue4d3';
const hashPlaceholderRight = '\ue3cc\uf1fe';
const hashPlaceholderOverhead = hashPlaceholderLeft.length + hashPlaceholderRight.length;

// TODO Lukas check on all systems
// depends on (...library)
const maxHashSize = 64;

export type HashPlaceholderGenerator = (hashSize: number) => string;

// TODO Lukas throw for maximum hash size exceeded
// TODO Lukas make hash size configurable via [hash:hashLength] and configure it per hash
// TODO Lukas reintroduce augmentChunkHash
export const getHashPlaceholderGenerator = (): HashPlaceholderGenerator => {
	let nextIndex = 0;
	return (hashSize: number) => {
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
		nextIndex++;
		return placeholder;
	};
};

const REPLACER_REGEX = new RegExp(
	`${hashPlaceholderLeft}\\d{1,${maxHashSize}}${hashPlaceholderRight}`,
	'g'
);

export const replacePlaceholders = (code: string, placeholderValues: Map<string, string>): string =>
	code.replace(REPLACER_REGEX, match => placeholderValues.get(match) || match);

// TODO Lukas test random match
export const replacePlaceholdersWithDefaultAndGetPositions = (
	code: string,
	placeholders: Set<string>
): { positions: Map<number, string>; result: string } => {
	const positions = new Map<number, string>();
	const result = code.replace(REPLACER_REGEX, (match, offset: number) => {
		if (placeholders.has(match)) {
			positions.set(offset, match);
			return `${hashPlaceholderLeft}${'0'.repeat(
				match.length - hashPlaceholderOverhead
			)}${hashPlaceholderRight}`;
		}
		return match;
	});
	return { positions, result };
};

export const replacePlaceholdersByPosition = (
	code: string,
	positions: Map<number, string>,
	placeholderValues: Map<string, string>
): string => {
	return code.replace(REPLACER_REGEX, (match, offset: number) => {
		const placeholder = positions.get(offset);
		if (placeholder) {
			return placeholderValues.get(placeholder)!;
		}
		return match;
	});
};
