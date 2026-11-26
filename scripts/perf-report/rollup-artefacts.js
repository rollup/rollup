import { pathToFileURL } from 'node:url';
import { rollup as newRollup } from '../../dist/rollup.js';

const previous = process.env.PERF_PREVIOUS_DIST
	? await import(pathToFileURL(process.env.PERF_PREVIOUS_DIST).href)
	: await import('rollup');

export const previousRollup = previous.rollup;
export const previousVersion = process.env.PERF_PREVIOUS_DIST || previous.VERSION;
export { newRollup };
