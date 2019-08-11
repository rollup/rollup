import { getWorkerMessage } from 'merged';
import { shared } from './shared';

document.body.innerHTML += `<h1>main: ${shared}</h1>`;
getWorkerMessage().then(message => (document.body.innerHTML += `<h1>1: ${message.data}</h1>`));

import('nested')
	.then(result => result.getWorkerMessage())
	.then(message => (document.body.innerHTML += `<h1>2: ${message.data}</h1>`));
