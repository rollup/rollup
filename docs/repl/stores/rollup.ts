import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RollupBuild, RollupOptions } from '../../../src/rollup/types';
import type * as Rollup from '../helpers/importRollup';
import { isRollupVersionAtLeast } from '../helpers/rollupVersion';

function getRollupUrl({ type, version }: RollupRequest) {
	if (type === 'pr') {
		return `https://rollup-ci-artefacts.s3.amazonaws.com/${version}/rollup.browser.js`;
	} else if (version) {
		if (isRollupVersionAtLeast(version, 4, 0)) {
			return `https://unpkg.com/@rollup/browser@${version}/dist/rollup.browser.js`;
		}
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
	if (import.meta.env.DEV && rollupRequest.type === 'local') {
		return import('../helpers/importRollup');
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

interface LoadedRollup {
	error: false;
	instance: {
		VERSION: string;
		rollup: (options: RollupOptions) => Promise<RollupBuild>;
	};
}

export type RequestedRollupInstance =
	| LoadedRollup
	| {
			[key in keyof LoadedRollup]: key extends 'error' ? false | Error : null;
	  };

type RollupRequest =
	| {
			type: 'version' | 'local';
			version: string | undefined;
	  }
	| { type: 'pr'; version: string };

export const useRollup = defineStore('rollup', () => {
	const loaded = ref<RequestedRollupInstance>({
		error: false,
		instance: null
	});
	const request = ref<RollupRequest | null>(null);

	async function requestRollup(rollupRequest: RollupRequest) {
		try {
			request.value = rollupRequest;
			const instance = await loadRollup(rollupRequest);
			if (import.meta.env.DEV) {
				instance.onUpdate(newInstance => {
					loaded.value = { error: false, instance: newInstance };
				});
			}
			loaded.value = {
				error: false,
				instance
			};
		} catch (error) {
			loaded.value = {
				error: error as Error,
				instance: null
			};
		}
	}

	function requestError(error: Error) {
		loaded.value = {
			error,
			instance: null
		};
	}

	return {
		loaded,
		request,
		requestError,
		requestRollup
	};
});
