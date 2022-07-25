import { spawn } from 'node:child_process';
import { bold, cyan, green } from './colors.js';

export function runWithEcho(command, args, options) {
	return new Promise((resolve, reject) => {
		const cmdString = formatCommand(command, args);
		console.error(bold(`\n${cyan`Run>`} ${cmdString}`));

		const childProcess = spawn(command, args, options);

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

export function runAndGetStdout(command, args) {
	return new Promise((resolve, reject) => {
		const childProcess = spawn(command, args);
		let stdout = '';

		childProcess.stderr.pipe(process.stderr);
		childProcess.stdout.on('data', data => (stdout += String(data)));

		childProcess.on('close', code => {
			if (code) {
				reject(new Error(`"${formatCommand(command, args)}" exited with code ${code}.`));
			} else {
				resolve(stdout.trim());
			}
		});
	});
}

function formatCommand(command, args) {
	return [command, ...args].join(' ');
}
