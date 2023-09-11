import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RollupBuild, RollupOptions } from '../../../src/rollup/types';
import type * as Rollup from '../helpers/importRollup';
import { isRollupVersionAtLeast } from '../helpers/rollupVersion';

const ROLLUP_JS_FILE = 'rollup.browser.js';
const ROLLUP_WASM_FILE = 'bindings_wasm_bg.wasm';

function isLoadLocalRollup({ type }: RollupRequest) {
	return import.meta.env.DEV && type === 'local';
}

function getFullUrlFromUnpkg(version: string | undefined, file: string) {
	return `https://unpkg.com/@rollup/browser${version ? `@${version}` : ''}/dist/${file}`;
}

function getFullUrlFromAWS(version: string, file: string) {
	return `https://rollup-ci-artefacts.s3.amazonaws.com/${version}/${file}`;
}

function getRollupJsUrl({ type, version }: RollupRequest) {
	if (type === 'pr') {
		return getFullUrlFromAWS(version, ROLLUP_JS_FILE);
	} else if (version) {
		if (isRollupVersionAtLeast(version, 3, 0)) {
			return getFullUrlFromUnpkg(version, ROLLUP_JS_FILE);
		}
		if (isRollupVersionAtLeast(version, 1, 0)) {
			return `https://unpkg.com/rollup@${version}/dist/rollup.browser.js`;
		}
		throw new Error('The REPL only supports Rollup versions >= 1.0.0.');
	}
	return getFullUrlFromUnpkg(undefined, ROLLUP_JS_FILE);
}

function getRollupWasmFileUrl({ type, version }: RollupRequest) {
	if (type === 'pr') {
		return getFullUrlFromAWS(version, ROLLUP_WASM_FILE);
	} else if (type === 'version' && version && isRollupVersionAtLeast(version, 4, 0)) {
		return getFullUrlFromUnpkg(version, ROLLUP_WASM_FILE);
	}
}

async function loadRollup(rollupRequest: RollupRequest): Promise<typeof Rollup> {
	if (isLoadLocalRollup(rollupRequest)) {
		return import('../helpers/importRollup');
	}
	const url = getRollupJsUrl(rollupRequest);
	const rollupWasmFileUrl = getRollupWasmFileUrl(rollupRequest);
	const preloadRollupWasmFile = rollupWasmFileUrl && fetch(rollupWasmFileUrl).catch(() => {});
	return new Promise((fulfil, reject) => {
		const script = document.createElement('script');
		script.src = url;
		script.addEventListener('load', async () => {
			preloadRollupWasmFile && (await preloadRollupWasmFile);
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
			if (isLoadLocalRollup(rollupRequest)) {
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
