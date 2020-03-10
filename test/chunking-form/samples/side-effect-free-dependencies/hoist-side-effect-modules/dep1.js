import './dep2-effect.js';
import './dep3.js'

export default function onlyUsedByOne(value) {
	console.log('Hello', value);
}
