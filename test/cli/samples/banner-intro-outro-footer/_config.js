module.exports = defineTest({
	description: 'adds banner/intro/outro/footer',
	command:
		'rollup -i main.js -f iife --indent --banner "// banner" --intro "// intro" --outro "// outro" --footer "// footer"'
});
