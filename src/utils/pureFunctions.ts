import type { NormalizedInputOptions } from '../rollup/types';

export const PureFunctionKey = Symbol('PureFunction');

export interface PureFunctions {
	[pathSegment: string]: PureFunctions;
	[PureFunctionKey]?: boolean;
}

export const getPureFunctions = ({ treeshake }: NormalizedInputOptions): PureFunctions => {
	const pureFunctions: PureFunctions = Object.create(null);
	for (const functionName of treeshake ? treeshake.manualPureFunctions : []) {
		let currentFunctions = pureFunctions;
		for (const pathSegment of functionName.split('.')) {
			currentFunctions = currentFunctions[pathSegment] ||= Object.create(null);
		}
		currentFunctions[PureFunctionKey] = true;
	}
	return pureFunctions;
};
