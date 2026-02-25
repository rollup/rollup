import type { ChunkDependency } from '../../Chunk';
import { error, logSourcePhaseFormatUnsupported } from '../../utils/logs';

export default function throwOnPhase(
	outputFormat: string,
	chunkId: string,
	dependencies: readonly ChunkDependency[]
): void {
	const sourcePhaseDependency = dependencies.find(dependency => dependency.sourcePhaseImport);
	if (sourcePhaseDependency) {
		error(logSourcePhaseFormatUnsupported(outputFormat, chunkId, sourcePhaseDependency.importPath));
	}
}
