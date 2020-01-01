module.exports = {
	description: 'stdin input of code that imports a copy of itself',
	command: `shx mkdir -p _actual && shx cat input.txt | rollup -f cjs --silent > _actual/out.js`
};
