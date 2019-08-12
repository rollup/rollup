export function log(url) {
	if (typeof document === 'undefined') {
		console.log(url);
	} else {
		document.body.innerHTML += url + '<br>';
	}
}
