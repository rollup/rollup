import { defineStore } from 'pinia';
import { ref } from 'vue';

export type RollupRequest =
	| {
			type: 'version' | 'pr';
			version: string;
	  }
	| { type: null; version: null };

// TODO Lukas merge with rollup? How do we handle missing version in URL?
export const useRollupRequest = defineStore('rollupRequest', () => {
	const request = ref<RollupRequest>({ type: null, version: null });
	const requestVersion = (version: string) => (request.value = { type: 'version', version });
	const requestPr = (version: string) => (request.value = { type: 'pr', version });
	return { request, requestPr, requestVersion };
});
