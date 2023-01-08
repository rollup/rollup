import { defineStore } from 'pinia';
import type * as Rollup from '../../../src/browser-entry';
import type { RollupBuild, RollupOptions } from '../../../src/rollup/types';
import { ref } from 'vue';
import { isRollupVersionAtLeast } from '../helpers/rollupVersion';

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
	if (import.meta.env.DEV && rollupRequest.type === 'local') {
		return import('../../../src/browser-entry');
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

type RollupRequest =
	| {
			type: 'version' | 'local';
			version: string | undefined;
	  }
	| { type: 'pr'; version: string };

export const useRollup = defineStore('rollup', () => {
	const rollup = ref<RequestedRollupInstance>({
		error: false,
		rollup: null,
		version: null
	});
	const request = ref<RollupRequest | null>(null);

	async function requestRollup(rollupRequest: RollupRequest) {
		try {
			request.value = rollupRequest;
			const loadedRollup = await loadRollup(rollupRequest);
			rollup.value = {
				error: false,
				rollup: loadedRollup.rollup,
				version: loadedRollup.VERSION
			};
		} catch (error) {
			rollup.value = {
				error: error as Error,
				rollup: null,
				version: null
			};
		}
	}

	return {
		request,
		requestRollup,
		rollup
	};
});
