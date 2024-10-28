import { appendFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export default new (class ReportCollector {
	/**
	 * @type {string[]}
	 */
	#messageList = [];
	#isRecording = false;
	startRecord() {
		this.#isRecording = true;
	}
	/**
	 * @param {string} message
	 */
	push(message) {
		if (!this.#isRecording) return;
		if (message.startsWith('# ')) {
			message = message.replace(/^# /, '- ');
		} else if (message.startsWith('## ')) {
			message = message.replace(/^## /, '  - ');
		} else if (message.startsWith('- ')) {
			message = '      ' + message;
		} else {
			message = '    - ' + message;
		}
		this.#messageList.push(message);
	}
	outputMsg() {
		if (process.env.CI) {
			const result = `# Performance report
${removeAnsiStyles(this.#messageList.join('\n'))}`;
			return Promise.all([
				writeFile(fileURLToPath(new URL('../../_benchmark/result.md', import.meta.url)), result),
				process.env.GITHUB_STEP_SUMMARY && appendFile(process.env.GITHUB_STEP_SUMMARY, result)
			]);
		}
	}
})();

/**
 * @param {string} text
 * @returns {string}
 */
function removeAnsiStyles(text) {
	const ansiRegex = new RegExp(
		[
			'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\u0007)',
			'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))'
		].join('|'),
		'g'
	);

	return text.replace(ansiRegex, '');
}
