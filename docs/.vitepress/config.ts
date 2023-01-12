import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitepress';
import '../types/declarations.d';
import { withMermaid } from 'vitepress-plugin-mermaid';

const legacySlugsByPage: Record<string, Record<string, string>> = JSON.parse(
	readFileSync(new URL('legacy-slugs.json', import.meta.url), 'utf8')
);
let currentSlugsAndTitles = new Map<string, string>();
const slugsByPage = new Map<string, Set<string>>();
// TODO Lukas do something with this
const slugsAndPageByLegacySlug: Record<string, [page: string, slug: string]> = {};

const markdownLinkRegExp = /(?<=\[[^\]]*]\()[^)]*/g;
const relativeLinkRegExp = /^\.\.\/[\w-]+\/index\.md(#.+|\?.+)?$/;

export default withMermaid(
	defineConfig({
		buildEnd() {
			for (const [page, slugs] of slugsByPage) {
				const text = readFileSync(new URL(`../${page}`, import.meta.url), 'utf8');
				let match: (RegExpExecArray & { groups?: { href?: string } }) | null;
				while ((match = markdownLinkRegExp.exec(text)) !== null) {
					const [href] = match;
					if (href.startsWith('#')) {
						const anchor = href.slice(1);
						if (!slugs.has(anchor)) {
							console.log(slugs);
							throw new Error(
								`Page ${page} references anchor ${anchor} but it cannot be found on this page. Slugs found on this page:\n${[
									...slugs
								]
									.sort()
									.join('\n')}\n`
							);
						}
					} else if (relativeLinkRegExp.test(href)) {
						const [linkPage, anchor] = href.split('#');
						if (anchor && !slugsByPage.get(linkPage.slice('../'.length))!.has(anchor)) {
							throw new Error(
								`Page ${page} references anchor ${anchor} on page ${linkPage} but it cannot be found.`
							);
						}
					} else if (!href.startsWith('http')) {
						throw new Error(
							`Unexpected internal link in ${page}: ${href}. Relative links should be of the form ../page/index.md, absolute links should start with https://.`
						);
					}
				}
			}
		},
		description: 'compile JS code',
		markdown: {
			anchor: {
				callback(_token, { title, slug }) {
					currentSlugsAndTitles.set(slug, title);
				}
			},
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
		transformPageData({ relativePath }) {
			slugsByPage.set(relativePath, new Set(currentSlugsAndTitles.keys()));
			const legacySlugs = legacySlugsByPage[relativePath];
			const page = relativePath.split('/')[0];
			if (legacySlugs) {
				slugsAndPageByLegacySlug[legacySlugs['']] = [page, ''];
				for (const [slug, title] of currentSlugsAndTitles) {
					const legacyTitle = title.replace(/["<>]/g, '');
					const legacySlug = legacySlugs[legacyTitle];
					if (legacySlug) {
						slugsAndPageByLegacySlug[legacySlug] = [page, slug];
					} else {
						console.log('Slug without match', slug, JSON.stringify(legacyTitle));
					}
				}
			}
			currentSlugsAndTitles = new Map();
		}
	})
);
