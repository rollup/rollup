export function emptyBlockStatement ( start, end ) {
	return {
		start, end,
		type: 'BlockStatement',
		body: []
	};
}
