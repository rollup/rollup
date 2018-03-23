import Chunk from './Chunk';
import ExternalModule from './ExternalModule';
import { OutputOptions } from './rollup';

/*
 * Given a chunk list, perform optimizations on that chunk list
 * to reduce the mumber of chunks
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
	const optimizedChunks: Chunk[] = chunks.concat([]);

	const chunkSize = new Map<Chunk, number>();
	function getChunkSize(chunk: Chunk) {
		let size = chunkSize.get(chunk);
		if (size) return size;
		size = chunk.getRenderedSourceLength();
		chunkSize.set(chunk, size);
		return size;
	}

	let seekingFirstChunkForMerge = true;
	let lastChunk: Chunk;

	for (let i = 0; i < optimizedChunks.length; i++) {
		if (seekingFirstChunkForMerge) {
			lastChunk = optimizedChunks[i];
			if (lastChunk.isEntryModuleFacade) {
				continue;
			}
			let nextChunk = optimizedChunks[i + 1];
			if (nextChunk && nextChunk.isEntryModuleFacade) {
				continue;
			}
			if (getChunkSize(lastChunk) > CHUNK_GROUPING_SIZE) {
				continue;
			}
			// if (!lastChunk.isPure()) continue;
			seekingFirstChunkForMerge = false;
			continue;
		}

		const chunk = optimizedChunks[i];
		const chunkSourceSize = getChunkSize(chunk);
		let remainingSize = CHUNK_GROUPING_SIZE - chunkSourceSize;
		if (remainingSize <= 0) {
			seekingFirstChunkForMerge = true;
			continue;
		}
		// if (!chunk.isPure()) continue;
		const chunkDependencies: (Chunk | External)[] = [];
		chunk.postVisit(dep => chunkDependencies.push(dep));
		remainingSize -= getChunkSize(lastChunk);
		if (remainingSize <= 0) {
			lastChunk = chunk;
			continue;
		}

		const lastChunkDependencies: (Chunk | External)[] = [];
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
			lastChunk = chunk;
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
			lastChunk = chunk;
			continue;
		}

		// within the size limit -> merge!
		optimizedChunks.splice(i--, 1);
		lastChunk.merge(chunk, optimizedChunks, options);
		chunkSize.delete(lastChunk);
		seekingFirstChunkForMerge = true;
	}

	return optimizedChunks;
}
