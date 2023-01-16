import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';
import '../declarations.d';
import { buildEnd, callback, transformPageData } from './verify-anchors';

export default withMermaid(
	defineConfig({
		buildEnd,
		description: 'compile JS code',
		markdown: {
			anchor: {
				callback,
				level: 2
			},
			lineNumbers: true,
			linkify: false,
			toc: {
				level: [2, 3, 4]
			}
		},
		themeConfig: {
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
			socialLinks: [{ icon: 'github', link: 'https://github.com/rollup/rollup' }]
		},
		title: 'Rollup',
		transformPageData
	})
);
