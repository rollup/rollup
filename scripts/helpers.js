import { spawn } from 'node:child_process';
import { bold, cyan, green } from './colors.js';

export function runWithEcho(command, parameters, options) {
	return new Promise((resolve, reject) => {
		const cmdString = formatCommand(command, parameters);
		console.error(bold(`\n${cyan`Run>`} ${cmdString}`));

		const childProcess = spawn(command, parameters, options);

		childProcess.stdout.pipe(process.stdout);
		childProcess.stderr.pipe(process.stderr);

		childProcess.on('close', code => {
			if (code) {
				reject(new Error(`"${cmdString}" exited with code ${code}.`));
			} else {
				console.error(bold(`${green`Finished>`} ${cmdString}\n`));
				resolve();
			}
		});
	});
}

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

function formatCommand(command, parameters) {
	return [command, ...parameters].join(' ');
}
