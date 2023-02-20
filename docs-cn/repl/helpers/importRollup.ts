export * from '../../../src/browser-entry';
import type * as Rollup from '../../../src/browser-entry';

let updateListener: null | ((instance: typeof Rollup) => void) = null;
export const onUpdate = (listener: (instance: typeof Rollup) => void) => {
	updateListener = listener;
};

if (import.meta.hot) {
	// This will enable HMR for any changes within the Rollup sources
	import.meta.hot.accept(newModule => {
		if (newModule && updateListener) {
			newModule.onUpdate(updateListener);
			updateListener(newModule as unknown as typeof Rollup);
		}
	});
}
