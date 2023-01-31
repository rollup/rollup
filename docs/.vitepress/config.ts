import alias from '@rollup/plugin-alias';
import { defineConfig } from 'vitepress';
import { moduleAliases } from '../../build-plugins/aliases';
import { resolutions } from '../../build-plugins/replace-browser-modules';
import '../declarations.d';
import { examplesPlugin } from './create-examples';
import { transposeTables } from './transpose-tables';
import { buildEnd, callback, transformPageData } from './verify-anchors';

export default defineConfig({
	buildEnd,
	description: 'compile JS code',
	head: [
		['link', { href: '/favicon.png', rel: 'icon', type: 'image/png' }],
		['link', { href: '/favicon.png', rel: 'apple-touch-icon', sizes: '128x128' }],
		['link', { href: '/manifest.json', rel: 'manifest' }],
		['meta', { content: '#333333', name: 'theme-color' }],
		['meta', { content: 'yes', name: 'mobile-web-app-capable' }],
		['meta', { content: 'default', name: 'apple-mobile-web-app-status-bar-style' }],
		['meta', { content: 'summary_large_image', name: 'twitter:card' }],
		['meta', { content: '@rollupjs', name: 'twitter:site' }],
		['meta', { content: '@rollupjs', name: 'twitter:creator' }],
		['meta', { content: 'Rollup', name: 'twitter:title' }],
		['meta', { content: 'The JavaScript module bundler', name: 'twitter:description' }],
		['meta', { content: 'https://rollupjs.org/twitter-card.jpg', name: 'twitter:image' }]
	],
	markdown: {
		anchor: {
			callback,
			level: 2
		},
		config(md) {
			transposeTables(md);
		},
		linkify: false,
		toc: {
			level: [2, 3, 4]
		}
	},
	themeConfig: {
		algolia: {
			apiKey: '233d24494bdf54811b5c3181883b5ee3',
			appId: 'V5XQ4IDZSG',
			indexName: 'rollupjs'
		},
		editLink: {
			pattern: 'https://github.com/rollup/rollup/edit/master/docs/:path',
			text: 'Edit this page on GitHub'
		},
		footer: {
			copyright: 'Copyright © 2015-present Rollup contributors',
			message: 'Released under the MIT License.'
		},
		logo: '/rollup-logo.svg',
		nav: [
			{ link: '/introduction/', text: 'guide' },
			{ link: '/repl/', text: 'repl' },
			{ link: 'https://is.gd/rollup_chat', text: 'chat' },
			{ link: 'https://opencollective.com/rollup', text: 'opencollective' }
		],
		outline: 'deep',
		sidebar: [
			{
				items: [
					{
						link: '/introduction/',
						text: 'Introduction'
					},
					{
						link: '/command-line-interface/',
						text: 'Command Line Interface'
					},
					{
						link: '/javascript-api/',
						text: 'Javascript API'
					}
				],
				text: 'Getting started'
			},
			{
				items: [
					{
						link: '/tutorial/',
						text: 'Tutorial'
					},
					{
						link: '/es-module-syntax/',
						text: 'ES Module Syntax'
					},
					{
						link: '/faqs/',
						text: 'Frequently Asked Questions'
					},
					{
						link: '/troubleshooting/',
						text: 'Troubleshooting'
					},
					{
						link: '/migration/',
						text: 'Migrating to Rollup 3'
					},
					{
						link: '/tools/',
						text: 'Other Tools'
					}
				],
				text: 'More info'
			},
			{
				items: [
					{
						link: '/configuration-options/',
						text: 'Configuration Options'
					},
					{
						link: '/plugin-development/',
						text: 'Plugin Development'
					}
				],
				text: 'API'
			}
		],
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/rollup/rollup' },
			{ icon: 'mastodon', link: 'https://m.webtoo.ls/@rollupjs' }
		]
	},
	title: 'Rollup',
	transformPageData,
	vite: {
		optimizeDeps: { include: ['moment-mini', '@braintree/sanitize-url'] },
		plugins: [
			{
				apply: 'serve',
				enforce: 'pre',
				name: 'replace-browser-modules',
				resolveId(source, importer) {
					if (importer && source.startsWith('/@fs')) {
						return resolutions.get(source.slice(4));
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
			examplesPlugin(),
			alias(moduleAliases)
		]
	}
});
