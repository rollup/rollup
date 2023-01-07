import alias from '@rollup/plugin-alias';
import { defineConfig } from 'vite';
import { moduleAliases } from '../build-plugins/aliases';
import { resolutions } from '../build-plugins/replace-browser-modules';

export default defineConfig({
	plugins: [
		{
			apply: 'serve',
			enforce: 'pre',
			name: 'replace-browser-modules',
			resolveId(source, importer) {
				if (importer && source.startsWith('/@fs')) {
					const resolved = source.slice(4);
					if (resolutions[resolved]) {
						return resolutions[resolved];
					}
				}
			},
			transformIndexHtml(html) {
				// Unfortunately, picomatch sneaks as a dedendency into the dev bundle.
				// This fixes an error.
				return html.replace('</head>', '<script>window.process={}</script></head>');
			}
		},
		{
			apply: 'build',
			enforce: 'pre',
			name: 'replace-local-rollup',
			resolveId(source) {
				if (source.includes('/browser-entry')) {
					return false;
				}
			}
		},
		alias(moduleAliases) as any
	]
});
