import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { blue, bold, cyan, green, magenta, red, yellow } from './colors.js';

const colors = [cyan, yellow, blue, red, green, magenta];
let nextColorIndex = 0;

/**
 * @param {string} command
 * @param {string[]} parameters
 * @param {Parameters<typeof spawn>[2]=} options
 * @return {Promise<void>}
 */
export function runWithEcho(command, parameters, options) {
	const color = colors[nextColorIndex];
	nextColorIndex = (nextColorIndex + 1) % colors.length;
	return /** @type {Promise<void>} */ (
		new Promise((resolve, reject) => {
			const cmdString = formatCommand(command, parameters);
			console.error(bold(`\n${color('Run>')} ${cmdString}`));

			const childProcess = spawn(command, parameters, { stdio: 'inherit', ...options });

			childProcess.on('close', code => {
				if (code) {
					reject(new Error(`"${cmdString}" exited with code ${code}.`));
				} else {
					console.error(bold(`${color('Finished>')} ${cmdString}\n`));
					resolve();
				}
			});
		})
	);
}

/**
 * @param {string} command
 * @param {string[]} parameters
 * @return {Promise<string>}
 */
export function runAndGetStdout(command, parameters) {
	return new Promise((resolve, reject) => {
		const childProcess = spawn(command, parameters);
		let stdout = '';

		childProcess.stderr.pipe(process.stderr);
		childProcess.stdout.on('data', data => (stdout += String(data)));

		childProcess.on('close', code => {
			if (code) {
				reject(new Error(`"${formatCommand(command, parameters)}" exited with code ${code}.`));
			} else {
				resolve(stdout.trim());
			}
		});
	});
}

/**
 * @param {string} command
 * @param {string[]} parameters
 * @return {string}
 */
function formatCommand(command, parameters) {
	return [command, ...parameters].join(' ');
}

/**
 * @param {string} file
 * @returns {Promise<Record<string, any>>}
 */
export async function readJson(file) {
	const content = await readFile(file, 'utf8');
	return JSON.parse(content);
}

/**
 * @param {URL} file
 * @return {Promise<void>}
 */
export async function lintFile(file) {
	const eslint = new ESLint({ fix: true });
	const results = await eslint.lintFiles([fileURLToPath(file)]);
	await ESLint.outputFixes(results);
	const formatter = await eslint.loadFormatter('stylish');
	const resultText = formatter.format(results);
	console.log(resultText);
}

/**
 * @param {string} string
 * @returns {string}
 */
export function firstLetterLowercase(string) {
	return string[0].toLowerCase() + string.slice(1);
}

/**
 * @param {string} string
 * @returns {string}
 */
export function toScreamingSnakeCase(string) {
	return string.replace(/(?<!^)([A-Z])/g, '_$1').toUpperCase();
}
