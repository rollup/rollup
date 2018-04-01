import { SerializedTimings } from '../../../src/rollup/types';
import chalk from 'chalk';

export function printTimings(timings: SerializedTimings) {
	Object.keys(timings).forEach(label => {
		let color = chalk;
		if (label[0] === '#') {
			color = color.bold;
			if (label[1] !== '#') {
				color = color.underline;
			}
		}
		console.info(color(`${label}: ${timings[label].toFixed(0)}ms`));
	});
}
