import prettyBytes from 'pretty-bytes';
import { SerializedTimings } from '../../src/rollup/types';
import { bold, underline } from '../../src/utils/colors';

export function printTimings(timings: SerializedTimings): void {
	Object.keys(timings).forEach(label => {
		const appliedColor =
			label[0] === '#' ? (label[1] !== '#' ? underline : bold) : (text: string) => text;
		const [time, memory, total] = timings[label];
		const row = `${label}: ${time.toFixed(0)}ms, ${prettyBytes(memory)} / ${prettyBytes(total)}`;
		console.info(appliedColor(row));
	});
}
