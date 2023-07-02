import type { NormalizedOutputOptions, RenderedChunk } from '../rollup/types';
import type { PluginDriver } from './PluginDriver';
import { error, logAddonNotGenerated } from './logs';

export interface Addons {
	banner: string;
	footer: string;
	intro: string;
	outro: string;
}

const concatSeparator = (out: string, next: string) => (next ? `${out}\n${next}` : out);
const concatDblSeparator = (out: string, next: string) => (next ? `${out}\n\n${next}` : out);

export async function createAddons(
	options: NormalizedOutputOptions,
	outputPluginDriver: PluginDriver,
	chunk: RenderedChunk
): Promise<Addons> {
	try {
		let [banner, footer, intro, outro] = await Promise.all([
			outputPluginDriver.hookReduceValue('banner', options.banner(chunk), [chunk], concatSeparator),
			outputPluginDriver.hookReduceValue('footer', options.footer(chunk), [chunk], concatSeparator),
			outputPluginDriver.hookReduceValue(
				'intro',
				options.intro(chunk),
				[chunk],
				concatDblSeparator
			),
			outputPluginDriver.hookReduceValue('outro', options.outro(chunk), [chunk], concatDblSeparator)
		]);
		if (intro) intro += '\n\n';
		if (outro) outro = `\n\n${outro}`;
		if (banner) banner += '\n';
		if (footer) footer = '\n' + footer;

		return { banner, footer, intro, outro };
	} catch (error_: any) {
		return error(logAddonNotGenerated(error_.message, error_.hook, error_.plugin));
	}
}
