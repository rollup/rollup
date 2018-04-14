import { runSequence } from './promise';
import error from './error';
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
		collectAddon(graph, options.banner, 'banner', '\n'),
		collectAddon(graph, options.footer, 'footer', '\n'),
		collectAddon(graph, options.intro, 'intro', '\n\n'),
		collectAddon(graph, options.outro, 'outro', '\n\n')
	]).then(([banner, footer, intro, outro]) => {
		if (intro) intro += '\n\n';
		if (outro) outro = `\n\n${outro}`;

		if (banner.length) banner += '\n';
		if (footer.length) footer = '\n' + footer;

		const hash = new Uint8Array(4);

		return { intro, outro, banner, footer, hash };
	});
}

function collectAddon(
	graph: Graph,
	initialAddon: string,
	addonName: 'banner' | 'footer' | 'intro' | 'outro',
	sep: string
) {
	return runSequence(
		[
			{
				pluginName: 'rollup',
				source: initialAddon
			} as {
				pluginName: string;
				source: string | (() => string);
			}
		]
			.concat(
				graph.plugins.map((plugin, idx) => ({
					pluginName: plugin.name || `Plugin at pos ${idx}`,
					source: plugin[addonName]
				}))
			)
			.filter(addon => {
				if (typeof addon.source === 'function') addon.source = addon.source();
				return addon.source;
			})
			.map(({ pluginName, source }) => {
				return Promise.resolve(source).catch(err =>
					error({
						code: 'ADDON_ERROR',
						message: `Could not retrieve ${addonName}. Check configuration of ${pluginName}.
Error Message: ${err.message}`
					})
				);
			})
	).then(addons => addons.filter(Boolean).join(sep));
}
