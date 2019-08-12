import prettyBytes from 'pretty-bytes';
import tc from 'turbocolor';
import { SerializedTimings } from '../../src/rollup/types';

export function printTimings(timings: SerializedTimings) {
	Object.keys(timings).forEach(label => {
		const color =
			label[0] === '#' ? (label[1] !== '#' ? tc.underline : tc.bold) : (text: string) => text;
		const [time, memory, total] = timings[label];
		const row = `${label}: ${time.toFixed(0)}ms, ${prettyBytes(memory)} / ${prettyBytes(total)}`;
		console.info(color(row));
	});
}
