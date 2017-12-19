export default function sequence (array, fn) {
	const results = [];
	let promise = Promise.resolve();

	function next (member, i) {
		return fn(member).then(value => (results[i] = value));
	}

	for (let i = 0; i < array.length; i += 1) {
		promise = promise.then(() => next(array[i], i));
	}

	return promise.then(() => results);
}
