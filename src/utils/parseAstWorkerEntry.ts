import { parentPort } from 'node:worker_threads';
import { parse } from '../../native';

parentPort!.on(
	'message',
	([id, code, allowReturnOutsideFunction]: [
		id: number,
		code: string,
		allowReturnOutsideFunction: boolean
	]) => {
		const buffer = parse(code, allowReturnOutsideFunction);
		parentPort!.postMessage([id, buffer], [buffer.buffer]);
	}
);
