import { exec } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import type { Plugin } from 'vite';
import { mkdir } from '../../src/utils/fs';
import { getFilesInDirectory } from './helpers';

const execPromise = promisify(exec);
const graphsDirectory = new URL('graphs/', import.meta.url);

const mermaidRegExp = /^```mermaid\n([\S\s]*?)\n```/gm;
const greaterThanRegExp = /&gt;/g;
const styleTagRegExp = /<style>[\S\s]*?<\/style>/gm;
const configFileURL = new URL('mermaid.config.json', import.meta.url);

export function renderMermaidGraphsPlugin(): Plugin {
	const existingGraphFileNamesPromise = mkdir(graphsDirectory, { recursive: true })
		.then(() => getFilesInDirectory(graphsDirectory))
		.then(files => new Set(files.filter(name => name.endsWith('.svg'))));
	const existingGraphsByName = new Map<string, Promise<string>>();

	async function renderGraph(codeBlock: string, outFile: string) {
		const existingGraphFileNames = await existingGraphFileNamesPromise;
		const outFileURL = new URL(outFile, graphsDirectory);
		if (!existingGraphFileNames.has(outFile)) {
			const inFileURL = new URL(`${outFile}.mmd`, graphsDirectory);
			await writeFile(inFileURL, codeBlock);
			const { stdout, stderr } = await execPromise(
				`npx mmdc --configFile ${fileURLToPath(configFileURL)} --input ${fileURLToPath(
					inFileURL
				)} --output ${fileURLToPath(outFileURL)}`
			);
			if (stderr.trim()) console.log(stderr.trim());
			if (stdout.trim()) console.log(stdout.trim());
		}
		const outFileContent = await readFile(outFileURL, 'utf8');
		// Styles need to be placed top-level, so we extract them and then
		// prepend them, separated with a line-break
		const extractedStyles: string[] = [];
		const baseGraph = outFileContent
			// We need to replace some HTML entities
			.replace(greaterThanRegExp, '>')
			.replace(styleTagRegExp, styleTag => {
				extractedStyles.push(styleTag);
				return '';
			});
		console.log('Extracted styles from mermaid chart:', extractedStyles.length);
		return `${extractedStyles.join('')}\n${baseGraph}`;
	}

	return {
		enforce: 'pre',
		name: 'render-mermaid-charts',
		async transform(code, id) {
			if (id.endsWith('.md')) {
				const renderedGraphs: string[] = [];
				const mermaidCodeBlocks: string[] = [];
				let match: RegExpExecArray | null = null;
				while ((match = mermaidRegExp.exec(code)) !== null) {
					mermaidCodeBlocks.push(match[1]);
				}
				await Promise.all(
					mermaidCodeBlocks.map(async (codeBlock, index) => {
						const outFile = `${createHash('sha256').update(codeBlock).digest('base64url')}.svg`;
						if (!existingGraphsByName.has(outFile)) {
							existingGraphsByName.set(outFile, renderGraph(codeBlock, outFile));
						}
						renderedGraphs[index] = await existingGraphsByName.get(outFile)!;
					})
				);
				return code.replace(mermaidRegExp, () => renderedGraphs.shift()!);
			}
		}
	};
}
