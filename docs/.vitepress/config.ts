import { defineConfig } from 'vitepress';

export default defineConfig({
	description: 'compile JS code',
	markdown: { linkify: false },
	themeConfig: {
		footer: {
			copyright: 'Copyright © 2015-present Rollup contributors',
			message: 'Released under the MIT License.'
		},
		logo: '/rollup-logo.svg',
		nav: [
			{ link: '/00-introduction', text: 'guide' },
			{ link: '/repl', text: 'repl' },
			{ link: 'https://is.gd/rollup_chat', text: 'chat' },
			{ link: 'https://github.com/rollup/rollup', text: 'github' },
			{ link: 'https://opencollective.com/rollup', text: 'opencollective' }
		],
		sidebar: [
			{
				items: [
					{
						link: '/00-introduction',
						text: 'Introduction'
					},
					{
						link: '/01-command-line-interface',
						text: 'Command Line Interface'
					},
					{
						link: '/02-javascript-api',
						text: 'Javascript API'
					}
				],
				text: 'Getting started'
			},
			{
				items: [
					{
						link: '/04-tutorial',
						text: 'Tutorial'
					},
					{
						link: '/03-es-module-syntax',
						text: 'ES Module Syntax'
					},
					{
						link: '/06-faqs',
						text: 'Frequently Asked Questions'
					},
					{
						link: '/08-troubleshooting',
						text: 'Troubleshooting'
					},
					{
						link: '/09-migration',
						text: 'Migrating to Rollup 3'
					},
					{
						link: '/07-tools',
						text: 'Integrating Rollup With Other Tools'
					}
				],
				text: 'More info'
			},
			{
				items: [
					{
						link: '/999-big-list-of-options',
						text: 'Configuration Options'
					},
					{
						link: '/05-plugin-development',
						text: 'Plugin Development'
					}
				],
				text: 'API'
			}
		]
	},
	title: 'Rollup'
});
