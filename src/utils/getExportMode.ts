import Chunk from '../Chunk';
import { NormalizedOutputOptions, WarningHandler } from '../rollup/types';
import {
	errIncompatibleExportOptionValue,
	errMixedExport,
	error,
	errPreferNamedExports
} from './error';

export default function getExportMode(
	chunk: Chunk,
	{ exports: exportMode, name, format }: NormalizedOutputOptions,
	unsetOptions: ReadonlySet<string>,
	facadeModuleId: string,
	warn: WarningHandler
): 'default' | 'named' | 'none' {
	const exportKeys = chunk.getExportNames();

	if (exportMode === 'default') {
		if (exportKeys.length !== 1 || exportKeys[0] !== 'default') {
			return error(errIncompatibleExportOptionValue('default', exportKeys, facadeModuleId));
		}
	} else if (exportMode === 'none' && exportKeys.length) {
		return error(errIncompatibleExportOptionValue('none', exportKeys, facadeModuleId));
	}

	if (exportMode === 'auto') {
		if (exportKeys.length === 0) {
			exportMode = 'none';
		} else if (exportKeys.length === 1 && exportKeys[0] === 'default') {
			if (format === 'cjs' && unsetOptions.has('exports')) {
				warn(errPreferNamedExports(facadeModuleId));
			}
			exportMode = 'default';
		} else {
			if (format !== 'es' && format !== 'system' && exportKeys.indexOf('default') !== -1) {
				warn(errMixedExport(facadeModuleId, name));
			}
			exportMode = 'named';
		}
	}

	return exportMode;
}
