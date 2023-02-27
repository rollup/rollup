import MagicString from 'magic-string';

export default {
	input: 'main.js',
	experimentalLogSideEffects: true,
	plugins: [
		{
			name: 'insert-lines',
			transform(code, id) {
				if (id.endsWith('mapped.js')) {
					const magicString = new MagicString(code);
					magicString.prepend('const removed = true;\nconst alsoRemoved = true; ');
					return { code: magicString.toString(), map: magicString.generateMap({ hires: true }) };
				}
			}
		}
	]
};
