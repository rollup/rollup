import Chunk from './Chunk';
import ExternalModule from './ExternalModule';
import { OutputOptions } from './rollup';

/*
 * Given a chunk list, perform optimizations on that chunk list
 * to reduce the mumber of chunks. Mutates the chunks array.
 *
 * Manual chunks (with chunk.chunkAlias already set) are preserved
 * Entry points are carefully preserved as well
 *
 * If an untainted entryPointFacade chunk is tainted by this process,
 * it will be assigned a new entrypoint facade.
 */
export function optimizeChunks(
	chunks: Chunk[],
	options: OutputOptions,
	CHUNK_GROUPING_SIZE = 5000
): Chunk[] {
	const optimizedChunks = chunks.concat([]);

	const chunkSize = new Map<Chunk, number>();
	function getChunkSize(chunk: Chunk) {
		let size = chunkSize.get(chunk);
		if (size) return size;
		size = chunk.getRenderedSourceLength();
		chunkSize.set(chunk, size);
		return size;
	}

	let i = 1;
	let seekingFirstChunkForMerge = true;
	let lastChunk: Chunk,
		chunk = optimizedChunks[0],
		nextChunk = optimizedChunks[1];

	do {
		if (seekingFirstChunkForMerge) {
			if (chunk.isEntryModuleFacade) {
				continue;
			}
			if (nextChunk && nextChunk.isEntryModuleFacade) {
				continue;
			}
			if (getChunkSize(chunk) > CHUNK_GROUPING_SIZE) {
				continue;
			}
			// if (!chunk.isPure()) continue;
			seekingFirstChunkForMerge = false;
			continue;
		}

		const chunkSourceSize = getChunkSize(chunk);
		let remainingSize = CHUNK_GROUPING_SIZE - chunkSourceSize;
		if (remainingSize <= 0) {
			seekingFirstChunkForMerge = true;
			continue;
		}
		// if (!chunk.isPure()) continue;
		remainingSize -= getChunkSize(lastChunk);
		if (remainingSize <= 0) {
			continue;
		}

		const chunkDependencies: (Chunk | External)[] = [lastChunk];
		chunk.postVisit(dep => chunkDependencies.push(dep));

		const lastChunkDependencies: (Chunk | External)[] = [chunk];
		if (
			lastChunk.postVisit(dep => {
				lastChunkDependencies.push(dep);
				if (chunkDependencies.indexOf(dep) !== -1) {
					return false;
				}
				if (dep instanceof ExternalModule) {
					return true;
				}
				remainingSize -= getChunkSize(dep);
				if (remainingSize <= 0) {
					return true;
				}
			})
		) {
			continue;
		}

		if (
			chunk.postVisit(dep => {
				if (lastChunkDependencies.indexOf(dep) !== -1) {
					return false;
				}
				if (dep instanceof ExternalModule) {
					return true;
				}
				remainingSize -= getChunkSize(dep);
				if (remainingSize <= 0) {
					return true;
				}
			})
		) {
			continue;
		}

		// within the size limit -> merge!
		optimizedChunks.splice(--i, 1);
		lastChunk.merge(chunk, optimizedChunks, options);
		chunk = lastChunk;
		chunkSize.set(chunk, CHUNK_GROUPING_SIZE - remainingSize);
		// keep going to see if we can merge this with the next again
		if (nextChunk && nextChunk.isEntryModuleFacade) {
			seekingFirstChunkForMerge = true;
		}
	} while (((lastChunk = chunk), (chunk = nextChunk), (nextChunk = optimizedChunks[++i]), chunk));

	return optimizedChunks;
}
