module.exports = {
	description: 'populates options.external with --global keys',
	command: 'rollup main.js --format iife --globals mathematics:Math',
	execute: true
};
