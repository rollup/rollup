import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { OutputOptions } from '../../../src/rollup/types';

export const useOptions = defineStore('options', () => {
	const options = ref<OutputOptions>({
		amd: { id: '' },
		format: 'es',
		globals: {},
		name: 'myBundle'
	});
	return {
		options,
		set(value: OutputOptions) {
			options.value = value as any;
		}
	};
});
