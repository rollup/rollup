import { readFileSync, writeFileSync } from 'node:fs';
import * as rollupLinks from '../../src/utils/urls';

const markdownLinkRegExp = /(?<=\[[^\]]*]\()[^)]*/g;
const mermaidLinkRegExp = /(?<=```mermaid[^`]*"#)[^"]+/gm;
const relativeLinkRegExp = /^\.\.\/[\w-]+\/index\.md(#.+|\?.+)?$/;

const legacySlugsByPage: Record<string, Record<string, string>> = JSON.parse(
	readFileSync(new URL('legacy-slugs.json', import.meta.url), 'utf8')
);
let currentSlugsAndTitles = new Map<string, string>();
const slugsByPage = new Map<string, Set<string>>();
const slugsAndPageByLegacySlug: Record<string, [page: string, slug: string]> = {};

export function buildEnd() {
	updateLegacySlugsFile();
	for (const [page, slugs] of slugsByPage) {
		verifyAnchorsOnPage(page, slugs);
	}
	verifyLinksInRollup();
}

function updateLegacySlugsFile() {
	const sortedSlugs = Object.fromEntries(
		Object.entries(slugsAndPageByLegacySlug).sort(([a], [b]) => (a < b ? -1 : 1))
	);
	const slugsFileText = JSON.stringify(sortedSlugs);
	const slugsFile = new URL(`../guide/en/slugs-and-pages-by-legacy-slugs.json`, import.meta.url);
	const originalSlugsFileText = readFileSync(slugsFile, 'utf8');
	if (originalSlugsFileText !== slugsFileText) {
		writeFileSync(slugsFile, slugsFileText);
		throw new Error(
			`The content of the legacy anchor mapping file has changed. You should run "npm run build:docs" locally and commit the updated file.`
		);
	}
}

function verifyAnchorsOnPage(page: string, slugs: Set<string>) {
	const text = readFileSync(new URL(`../${page}`, import.meta.url), 'utf8');
	let match: (RegExpExecArray & { groups?: { href?: string } }) | null;
	while ((match = markdownLinkRegExp.exec(text)) !== null) {
		const [href] = match;
		if (href[0] === '#') {
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
		} else if (!(href.startsWith('https://') || href.startsWith('<https://'))) {
			throw new Error(
				`Unexpected internal link in ${page}: ${href}. Relative links should be of the form ../page/index.md, absolute links should start with https://.`
			);
		}
	}
	while ((match = mermaidLinkRegExp.exec(text)) !== null) {
		const anchor = match[0];
		if (!slugs.has(anchor)) {
			throw new Error(
				`Page ${page} references anchor ${anchor} in a mermaid graph but it cannot be found on this page. Slugs found on this page:\n${[
					...slugs
				]
					.sort()
					.join('\n')}\n`
			);
		}
	}
}

function verifyLinksInRollup() {
	for (const link of Object.values(rollupLinks)) {
		const [pageBase, hash] = link.split('/#');
		const slugs = slugsByPage.get(`${pageBase}/index.md`);
		if (!slugs) {
			throw new Error(`Could not find page ${pageBase} referenced in Rollup sources.`);
		}
		if (!slugs.has(hash)) {
			throw new Error(
				`Could not find anchor ${hash} on page ${pageBase} that is referenced in Rollup sources. Slugs found on this page:\n${[
					...slugs
				]
					.sort()
					.join('\n')}\n`
			);
		}
	}
}

export function transformPageData({ relativePath }: { relativePath: string }) {
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
				console.log(
					`Slug without legacy match in ${relativePath}: #${slug} from ${JSON.stringify(
						legacyTitle
					)}`
				);
			}
		}
	}
	currentSlugsAndTitles = new Map();
}

export function callback(_token: unknown, { slug, title }: { slug: string; title: string }) {
	currentSlugsAndTitles.set(slug, title);
}
