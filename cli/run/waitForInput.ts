import color from 'colorette';
import { NormalizedInputOptions, PluginContext } from '../../src/rollup/types';
import { stderr } from '../logging';

export function waitForInputPlugin() {
	return {
		name: 'wait-for-input',
		async buildStart(this: PluginContext, options: NormalizedInputOptions) {
			const inputSpecifiers = Array.isArray(options.input)
				? options.input
				: Object.keys(options.input as { [entryAlias: string]: string });

			let lastAwaitedSpecifier = null;
			checkSpecifiers: while (true) {
				for (const specifier of inputSpecifiers) {
					if ((await this.resolve(specifier)) === null) {
						if (lastAwaitedSpecifier !== specifier) {
							stderr(`waiting for input ${color.bold(specifier)}...`);
							lastAwaitedSpecifier = specifier;
						}
						await new Promise(resolve => setTimeout(resolve, 500));
						continue checkSpecifiers;
					}
				}
				break;
			}
		}
	};
}
