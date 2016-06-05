import { answer as importedAnswer } from './answer.js';
export { answer as exportedAnswer } from './answer.js';

export function foo () {
	var value;
	value = importedAnswer;
	return value;
}
