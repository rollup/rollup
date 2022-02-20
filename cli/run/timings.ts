import prettyBytes from 'pretty-bytes';
import type { SerializedTimings } from '../../src/rollup/types';
import { bold, underline } from '../../src/utils/colors';

export function printTimings(timings: SerializedTimings): void {
	Object.entries(timings).forEach(([label, [time, memory, total]]) => {
		const appliedColor =
			label[0] === '#' ? (label[1] !== '#' ? underline : bold) : (text: string) => text;
		const row = `${label}: ${time.toFixed(0)}ms, ${prettyBytes(memory)} / ${prettyBytes(total)}`;
		console.info(appliedColor(row));
	});
}
