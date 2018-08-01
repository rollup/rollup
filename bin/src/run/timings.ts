import tc from 'turbocolor';
import { SerializedTimings } from '../../../src/rollup/types';

export function printTimings(timings: SerializedTimings) {
	Object.keys(timings).forEach(label => {
		const color =
			label[0] === '#' ? (label[1] !== '#' ? tc.underline : tc.bold) : (text: string) => text;
		console.info(color(`${label}: ${timings[label].toFixed(0)}ms`));
	});
}
