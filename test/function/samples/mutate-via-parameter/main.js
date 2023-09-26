export function test(callback) {
	const state = {
		modified: false
	};
	callback(state);
	if (state.modified) return true;
	return false;
}
