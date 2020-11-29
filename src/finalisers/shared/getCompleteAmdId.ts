import { NormalizedOutputOptions } from '../../rollup/types';
import removeJsExtension from './removeJsExtension';

export default function getCompleteAmdId(
	options: NormalizedOutputOptions['amd'],
	chunkId: string
): string {
	if (!options.autoId) {
		return options.id || '';
	} else {
		return `${options.basePath ? options.basePath + '/' : ''}${removeJsExtension(chunkId)}`;
	}
}
