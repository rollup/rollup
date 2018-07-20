import tc from 'turbocolor';
import { SerializedTimings } from '../../../src/rollup/types';

export function printTimings(timings: SerializedTimings) {
	Object.keys(timings).forEach(label => {
		let color = tc;
		if (label[0] === '#') {
			color = color.bold;
			if (label[1] !== '#') {
				color = color.underline;
			}
		}
		console.info(color(`${label}: ${timings[label].toFixed(0)}ms`));
	});
}
