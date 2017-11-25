module.exports = {
	description: 'allows external modules to be specified with --external=foo,bar,baz',
	command: 'rollup main.js --output.format cjs --external path,util',
	execute: true
};
