import Graph from '../Graph';
import { OutputOptions } from '../rollup/types';
import error from './error';

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
	initialAddon: string | (() => string | Promise<string>),
	addonName: 'banner' | 'footer' | 'intro' | 'outro',
	sep: string
) {
	return Promise.all(
		[
			{
				pluginName: 'rollup',
				source: initialAddon
			},
			...graph.plugins.map((plugin, idx) => ({
				pluginName: plugin.name || `Plugin at pos ${idx}`,
				source: plugin[addonName]
			}))
		].map(({ pluginName, source }, idx) => {
			if (!source) return;

			if (typeof source === 'string') return source;

			return Promise.resolve()
				.then(() => {
					return source.call(idx !== 0 && graph.pluginContext);
				})
				.catch(err => {
					error({
						code: 'ADDON_ERROR',
						message: `Could not retrieve ${addonName}. Check configuration of ${pluginName}.
\tError Message: ${err.message}`
					});
				});
		})
	).then(addons => addons.filter(Boolean).join(sep));
}
