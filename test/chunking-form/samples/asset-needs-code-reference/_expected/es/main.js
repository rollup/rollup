var asset2 = new URL('logo2.svg', import.meta.url).href;

{
	const image = document.createElement('img');
	image.src = asset2;
	document.body.appendChild(image);
}
