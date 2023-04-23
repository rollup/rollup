module.exports = defineTest({
	description: 'uses stdin to inline a require()',
	skipIfWindows: true,
	command: `echo 'console.log(require("./add.js")(2, 1));' | rollup --stdin=js -p commonjs -f cjs --exports=auto`
});
