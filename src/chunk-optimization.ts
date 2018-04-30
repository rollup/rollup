import Chunk from './Chunk';
import ExternalModule from './ExternalModule';
import { OutputOptions } from './rollup/types';

/*
 * Given a chunk list, perform optimizations on that chunk list
 * to reduce the mumber of chunks. Mutates the chunks array.
 *
 * Manual chunks (with chunk.chunkAlias already set) are preserved
 * Entry points are carefully preserved as well
 *
 */
export function optimizeChunks(
	chunks: Chunk[],
	options: OutputOptions,
	CHUNK_GROUPING_SIZE: number,
	inputBase: string
): Chunk[] {
	for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
		const mainChunk = chunks[chunkIndex];
		const execGroup: Chunk[] = [];
		mainChunk.postVisitChunkDependencies(dep => {
			if (dep instanceof Chunk) {
				execGroup.push(dep);
			}
		});

		if (execGroup.length < 2) {
			continue;
		}

		let execGroupIndex = 1;
		let seekingFirstMergeCandidate = true;
		let lastChunk: Chunk,
			chunk = execGroup[0],
			nextChunk = execGroup[1];

		const isMergeCandidate = (chunk: Chunk) => {
			if (chunk.isEntryModuleFacade || chunk.isManualChunk) {
				return false;
			}
			if (!nextChunk || nextChunk.isEntryModuleFacade) {
				return false;
			}
			if (chunk.getRenderedSourceLength() > CHUNK_GROUPING_SIZE) {
				return false;
			}
			// if (!chunk.isPure()) continue;
			return true;
		};

		do {
			if (seekingFirstMergeCandidate) {
				if (isMergeCandidate(chunk)) {
					seekingFirstMergeCandidate = false;
				}
				continue;
			}

			let remainingSize =
				CHUNK_GROUPING_SIZE - lastChunk.getRenderedSourceLength() - chunk.getRenderedSourceLength();
			if (remainingSize <= 0) {
				if (!isMergeCandidate(chunk)) {
					seekingFirstMergeCandidate = true;
				}
				continue;
			}
			// if (!chunk.isPure()) continue;

			const chunkDependencies = new Set<Chunk | External>();
			chunk.postVisitChunkDependencies(dep => chunkDependencies.add(dep));

			const ignoreSizeChunks = new Set<Chunk | External>([chunk, lastChunk]);
			if (
				lastChunk.postVisitChunkDependencies(dep => {
					if (dep === chunk || dep === lastChunk) {
						return false;
					}
					if (chunkDependencies.has(dep)) {
						return false;
					}
					if (dep instanceof ExternalModule) {
						return true;
					}
					remainingSize -= dep.getRenderedSourceLength();
					if (remainingSize <= 0) {
						return true;
					}
					ignoreSizeChunks.add(dep);
				})
			) {
				if (!isMergeCandidate(chunk)) {
					seekingFirstMergeCandidate = true;
				}
				continue;
			}

			if (
				chunk.postVisitChunkDependencies(dep => {
					if (ignoreSizeChunks.has(dep)) {
						return false;
					}
					if (dep instanceof ExternalModule) {
						return true;
					}
					remainingSize -= dep.getRenderedSourceLength();
					if (remainingSize <= 0) {
						return true;
					}
				})
			) {
				if (!isMergeCandidate(chunk)) {
					seekingFirstMergeCandidate = true;
				}
				continue;
			}

			// within the size limit -> merge!
			const optimizedChunkIndex = chunks.indexOf(chunk);
			if (optimizedChunkIndex <= chunkIndex) chunkIndex--;
			chunks.splice(optimizedChunkIndex, 1);

			lastChunk.merge(chunk, chunks, options, inputBase);

			execGroup.splice(--execGroupIndex, 1);

			chunk = lastChunk;
			// keep going to see if we can merge this with the next again
			if (nextChunk && !isMergeCandidate(nextChunk)) {
				seekingFirstMergeCandidate = true;
			}
		} while (
			((lastChunk = chunk), (chunk = nextChunk), (nextChunk = execGroup[++execGroupIndex]), chunk)
		);
	}

	return chunks;
}
