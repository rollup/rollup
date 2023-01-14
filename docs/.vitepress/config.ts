import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';
import '../declarations.d';
import { buildEnd, callback, transformPageData } from './verify-anchors';

export default withMermaid(
	defineConfig({
		buildEnd,
		description: 'compile JS code',
		markdown: {
			anchor: { callback },
			linkify: false
		},
		themeConfig: {
			footer: {
				copyright: 'Copyright © 2015-present Rollup contributors',
				message: 'Released under the MIT License.'
			},
			logo: '../rollup-logo.svg',
			nav: [
				{ link: '/introduction/', text: 'guide' },
				{ link: '/repl/', text: 'repl' },
				{ link: 'https://is.gd/rollup_chat', text: 'chat' },
				{ link: 'https://github.com/rollup/rollup', text: 'github' },
				{ link: 'https://opencollective.com/rollup', text: 'opencollective' }
			],
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
							text: 'Integrating Rollup With Other Tools'
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
			]
		},
		title: 'Rollup',
		transformPageData
	})
);
