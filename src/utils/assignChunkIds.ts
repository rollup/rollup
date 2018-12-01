import Chunk from '../Chunk';
import { InputOptions, OutputOptions } from '../rollup/types';
import { Addons } from './addons';
import { basename } from './path';

export function assignChunkIds(
	chunks: Chunk[],
	singleChunk: Chunk | void,
	inputOptions: InputOptions,
	outputOptions: OutputOptions,
	inputBase: string,
	addons: Addons
) {
	const usedIds: Record<string, true> = {};
	const [entryChunks, otherChunks] = chunks.reduce(
		([entryChunks, otherChunks], chunk) => {
			(chunk.facadeModule && chunk.facadeModule.isEntryPoint ? entryChunks : otherChunks).push(
				chunk
			);
			return [entryChunks, otherChunks];
		},
		[[], []]
	);

	// make sure entry chunk names take precedence with regard to deconflicting
	const chunksForNaming: Chunk[] = entryChunks.concat(otherChunks);
	for (let i = 0; i < chunksForNaming.length; i++) {
		const chunk = chunksForNaming[i];

		if (chunk === singleChunk) {
			singleChunk.id = basename(
				outputOptions.file ||
					(inputOptions.input instanceof Array ? inputOptions.input[0] : <string>inputOptions.input)
			);
		} else if (inputOptions.experimentalPreserveModules) {
			chunk.generateIdPreserveModules(inputBase, usedIds);
		} else {
			let pattern, patternName;
			if (chunk.facadeModule && chunk.facadeModule.isEntryPoint) {
				pattern = outputOptions.entryFileNames || '[name].js';
				patternName = 'output.entryFileNames';
			} else {
				pattern = outputOptions.chunkFileNames || '[name]-[hash].js';
				patternName = 'output.chunkFileNames';
			}
			chunk.generateId(pattern, patternName, addons, outputOptions, usedIds);
		}
		usedIds[chunk.id] = true;
	}
}
