export default function(options = {}) {
	const {comment} = options;
	return {
		transform(code) {
			return `// Hello ${comment}\n${code}`;
		}
	};
};
