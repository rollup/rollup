import type { PluginContext } from 'rollup';
import type { NormalizedInputOptions, Plugin } from '../../src/rollup/types';
import { bold } from '../../src/utils/colors';
import { stderr } from '../logging';

export function waitForInputPlugin(): Plugin {
	return {
		async buildStart(this: PluginContext, options: NormalizedInputOptions) {
			const inputSpecifiers = Array.isArray(options.input)
				? options.input
				: Object.keys(options.input);

			let lastAwaitedSpecifier: string | null = null;
			checkSpecifiers: while (true) {
				for (const specifier of inputSpecifiers) {
					if ((await this.resolve(specifier)) === null) {
						if (lastAwaitedSpecifier !== specifier) {
							stderr(`waiting for input ${bold(specifier)}...`);
							lastAwaitedSpecifier = specifier;
						}
						await new Promise(resolve => setTimeout(resolve, 500));
						continue checkSpecifiers;
					}
				}
				break;
			}
		},
		name: 'wait-for-input'
	};
}
