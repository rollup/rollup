module.exports = {
	solo: true,
	description: 'adds banner/intro/outro/footer',
	command: 'rollup -i main.js -f iife --banner "// banner" --intro "// intro" --outro "// outro" --footer "// footer"'
};
