import { isRollupVersionAtLeast } from '../helpers/rollupVersion';
import type { RollupRequest } from './rollupRequest';
import { useRollupRequest } from './rollupRequest';
import { ref, watch } from 'vue';
import type { RollupBuild, RollupOptions } from 'rollup';
import type * as Rollup from 'rollup';
import { defineStore } from 'pinia';

function getRollupUrl({ type, version }: RollupRequest) {
	if (type === 'pr') {
		return `https://rollup-ci-artefacts.s3.amazonaws.com/${version}/rollup.browser.js`;
	} else if (version) {
		if (isRollupVersionAtLeast(version, 3, 0)) {
			return `https://unpkg.com/@rollup/browser@${version}`;
		}
		if (isRollupVersionAtLeast(version, 1, 0)) {
			return `https://unpkg.com/rollup@${version}/dist/rollup.browser.js`;
		}
		throw new Error('The REPL only supports Rollup versions >= 1.0.0.');
	}
	return 'https://unpkg.com/@rollup/browser';
}

function loadRollup(rollupRequest: RollupRequest): Promise<typeof Rollup> {
	if (import.meta.env.DEV && (!rollupRequest.version || rollupRequest.version === 'local')) {
		return import('../../../src/browser-entry').then(result => ({
			...result,
			VERSION: 'local'
		})) as any;
	}
	const url = getRollupUrl(rollupRequest);
	return new Promise((fulfil, reject) => {
		const script = document.createElement('script');
		script.src = url;
		script.addEventListener('load', () => {
			fulfil((window as any).rollup);
		});
		script.addEventListener('error', () => {
			reject(
				new Error(
					rollupRequest.type === 'pr'
						? `Could not load Rollup from PR #${rollupRequest.version}.`
						: `Could not load Rollup from ${url}.`
				)
			);
		});
		document.querySelector('head')!.append(script);
	});
}

interface RollupInstance {
	error: false;
	rollup: (options: RollupOptions) => Promise<RollupBuild>;
	version: string;
}

export type RequestedRollupInstance =
	| RollupInstance
	| {
			[key in keyof RollupInstance]: key extends 'error' ? false | Error : null;
	  };

export const useRollup = defineStore('rollup', () => {
	const requestStore = useRollupRequest();
	const rollup = ref<RequestedRollupInstance>({
		error: false,
		rollup: null,
		version: null
	});

	let currentRollupRequest: RollupRequest = { type: null, version: null };

	function isRollupRequestCurrent(rollupRequest: RollupRequest) {
		return (
			rollupRequest.type === currentRollupRequest.type &&
			rollupRequest.version === currentRollupRequest.version
		);
	}

	watch(
		() => requestStore.request,
		async request => {
			if (request.type && !isRollupRequestCurrent(request)) {
				currentRollupRequest = request;
				try {
					const loadedRollup = await loadRollup(request);
					if (isRollupRequestCurrent(request)) {
						rollup.value = {
							error: false,
							rollup: loadedRollup.rollup,
							version: loadedRollup.VERSION
						};
					}
				} catch (error) {
					if (isRollupRequestCurrent(request)) {
						rollup.value = {
							error: error as Error,
							rollup: null,
							version: null
						};
					}
				}
			}
		}
	);

	return { rollup };
});
