import { NormalizedOutputOptions } from '../../rollup/types';
import removeJsExtension from './removeJsExtension';

export default function getCompleteAmdId(
	{ id, autoId, basePath }: NormalizedOutputOptions['amd'],
	chunkId: string
): string {
	if (id) {
		return id;
	} else if (autoId) {
		return `${basePath ? basePath + '/' : ''}${removeJsExtension(chunkId)}`;
	} else {
		return '';
	}
}
