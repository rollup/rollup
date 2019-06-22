export default Promise.all([
	import('./exists-named.js').catch(err => err),
	import('./exists-default.js').catch(err => err),
	import('does-not-exist').catch(err => err)
]);
