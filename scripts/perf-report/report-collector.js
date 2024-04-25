import { writeFile } from 'node:fs/promises';
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
		if (message.startsWith('#')) {
			message = '##' + message;
		}
		this.#messageList.push(message);
	}
	outputMsg() {
		if (process.env.CI) {
			return writeFile(
				fileURLToPath(new URL('../../_benchmark/internal-report.md', import.meta.url)),
				this.#messageList.join('\n')
			);
		}
	}
})();
