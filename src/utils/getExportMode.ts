import type Chunk from '../Chunk';
import type { NormalizedOutputOptions, WarningHandler } from '../rollup/types';
import { error, errorIncompatibleExportOptionValue, errorMixedExport } from './error';

export default function getExportMode(
	chunk: Chunk,
	{ exports: exportMode, name, format }: NormalizedOutputOptions,
	facadeModuleId: string,
	warn: WarningHandler
): 'default' | 'named' | 'none' {
	const exportKeys = chunk.getExportNames();

	if (exportMode === 'default') {
		if (exportKeys.length !== 1 || exportKeys[0] !== 'default') {
			return error(errorIncompatibleExportOptionValue('default', exportKeys, facadeModuleId));
		}
	} else if (exportMode === 'none' && exportKeys.length > 0) {
		return error(errorIncompatibleExportOptionValue('none', exportKeys, facadeModuleId));
	}

	if (exportMode === 'auto') {
		if (exportKeys.length === 0) {
			exportMode = 'none';
		} else if (exportKeys.length === 1 && exportKeys[0] === 'default') {
			exportMode = 'default';
		} else {
			if (format !== 'es' && format !== 'system' && exportKeys.includes('default')) {
				warn(errorMixedExport(facadeModuleId, name));
			}
			exportMode = 'named';
		}
	}

	return exportMode;
}
