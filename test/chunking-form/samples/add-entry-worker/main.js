import { getWorkerMessage } from 'merged';

getWorkerMessage().then(message => document.write(`<h1>1: ${message.data}</h1>`));

import('nested')
	.then(result => result.getWorkerMessage())
	.then(message => document.write(`<h1>2: ${message.data}</h1>`));
