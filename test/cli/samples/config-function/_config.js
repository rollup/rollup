module.exports = {
	description: 'if config returns a function then this will be called with command args',
	command: 'rollup --config rollup.config.js --silent --some-option="foo" --another-option=42',
	execute: true
};
