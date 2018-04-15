import { runSequence } from './promise';
import error from './error';
import callIfFunction from './callIfFunction';
import Graph from '../Graph';
import { OutputOptions } from '../rollup/types';

export interface Addons {
	intro?: string;
	outro?: string;
	banner?: string;
	footer?: string;
	hash: Uint8Array;
}

export function createAddons(graph: Graph, options: OutputOptions): Promise<Addons> {
	return Promise.all([
		collectAddon(graph, options.banner, 'banner'),
		collectAddon(graph, options.footer, 'footer'),
		collectAddon(graph, options.intro, 'intro', '\n\n'),
		collectAddon(graph, options.outro, 'outro', '\n\n')
	]).then(([banner, footer, intro, outro]) => {
		if (intro) intro += '\n\n';
		if (outro) outro = `\n\n${outro}`;

		const hash = new Uint8Array(4);

		return { intro, outro, banner, footer, hash };
	});
}

function collectAddon(
	graph: Graph,
	initialAddon: string,
	addonName: 'banner' | 'footer' | 'intro' | 'outro',
	sep: string = '\n'
) {
	return runSequence(
		[
			{ pluginName: 'rollup', source: initialAddon } as {
				pluginName: string;
				source: string | (() => string);
			}
		]
			.concat(
				graph.plugins.map((plugin, idx) => {
					return {
						pluginName: plugin.name || `Plugin at pos ${idx}`,
						source: plugin[addonName]
					};
				})
			)
			.map(addon => {
				addon.source = callIfFunction(addon.source);
				return addon;
			})
			.filter(addon => {
				return addon.source;
			})
			.map(({ pluginName, source }) => {
				return Promise.resolve(source).catch(err => {
					error({
						code: 'ADDON_ERROR',
						message: `Could not retrieve ${addonName}. Check configuration of ${pluginName}.
	Error Message: ${err.message}`
					});
				});
			})
	).then(addons => addons.filter(Boolean).join(sep));
}
