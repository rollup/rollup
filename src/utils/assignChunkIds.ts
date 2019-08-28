import Chunk from '../Chunk';
import { InputOptions, OutputBundleWithPlaceholders, OutputOptions } from '../rollup/types';
import { Addons } from './addons';
import { FILE_PLACEHOLDER } from './FileEmitter';
import { basename } from './path';

export function assignChunkIds(
	chunks: Chunk[],
	inputOptions: InputOptions,
	outputOptions: OutputOptions,
	inputBase: string,
	addons: Addons,
	bundle: OutputBundleWithPlaceholders
) {
	const entryChunks: Chunk[] = [];
	const otherChunks: Chunk[] = [];
	for (const chunk of chunks) {
		(chunk.facadeModule && chunk.facadeModule.isUserDefinedEntryPoint
			? entryChunks
			: otherChunks
		).push(chunk);
	}

	// make sure entry chunk names take precedence with regard to deconflicting
	const chunksForNaming: Chunk[] = entryChunks.concat(otherChunks);
	for (const chunk of chunksForNaming) {
		if (outputOptions.file) {
			chunk.id = basename(outputOptions.file);
		} else if (inputOptions.preserveModules) {
			chunk.id = chunk.generateIdPreserveModules(inputBase, bundle);
		} else {
			chunk.id = chunk.generateId(addons, outputOptions, bundle, true);
		}
		bundle[chunk.id] = FILE_PLACEHOLDER;
	}
}
