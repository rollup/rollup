var logo = new URL('assets/logo-da3mn9ig.svg', import.meta.url).href;

var logoReverse = new URL('assets/logo_reverse\'-m88qzsd0.svg', import.meta.url).href;

function showImage(url) {
	console.log(url);
	if (typeof document !== 'undefined') {
		const image = document.createElement('img');
		image.src = url;
		document.body.appendChild(image);
	}
}

showImage(logo);
showImage(logoReverse);
