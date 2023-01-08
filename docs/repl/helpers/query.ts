import type { OutputOptions } from '../../../src/rollup/types';
import { watch } from 'vue';
import type { Module } from '../stores/modules';
import { useModules } from '../stores/modules';
import { useOptions } from '../stores/options';
import { useRollup } from '../stores/rollup';

export async function useUpdateStoresFromQuery() {
	const modulesStore = useModules();
	const optionsStore = useOptions();
	const rollupStore = useRollup();
	const urlParameters = new URLSearchParams(location.search);
	const query = Object.fromEntries(urlParameters as unknown as Iterable<[string, string]>);
	try {
		if (query.shareable) {
			const json = decodeURIComponent(atob(query.shareable));
			const {
				modules: queryModules,
				options: queryOptions,
				example
			}: {
				example: string;
				modules: Module[];
				options: OutputOptions;
			} = JSON.parse(json);
			modulesStore.set(queryModules, example);
			optionsStore.set(queryOptions);
		} else if (query.gist) {
			const result = await (
				await fetch(`https://api.github.com/gists/${query.gist}`, {
					headers: { Accept: 'application/vnd.github.v3+json' },
					method: 'GET'
				})
			).json();
			const entryModules = query.entry ? query.entry.split(',') : [];
			modulesStore.set(
				[
					result.files['main.js'] || { content: '', filename: 'main.js' },
					...Object.keys(result.files)
						.filter(fileName => fileName !== 'main.js')
						.map(fileName => result.files[fileName])
				].map(module => ({
					code: module.content,
					isEntry: entryModules.includes(module.filename),
					name: module.filename
				})),
				''
			);
		} else if (modulesStore.modules.length === 0) {
			modulesStore.selectExample('00');
		}
	} catch (error) {
		console.error(error);
		modulesStore.selectExample('00');
	}

	if (query.pr) {
		rollupStore.requestRollup({ type: 'pr', version: query.pr });
	} else if (import.meta.env.DEV && (query.local || !query.version)) {
		rollupStore.requestRollup({ type: 'local', version: undefined });
	} else {
		rollupStore.requestRollup({ type: 'version', version: query.version });
	}
}

export function useSyncQueryWithStores() {
	const modulesStore = useModules();
	const optionsStore = useOptions();
	const rollupStore = useRollup();
	watch(
		[
			() => modulesStore.modules,
			() => optionsStore.options,
			() => modulesStore.selectedExample,
			() => rollupStore.request,
			() => rollupStore.rollup.version
		],
		([modules, options, selectedExample, rollupRequest, rollupVersion]) => {
			const parameters: Record<string, string> = {};
			if (rollupRequest?.type === 'pr') {
				parameters.pr = rollupRequest.version;
			} else if (import.meta.env.DEV && rollupRequest?.type === 'local') {
				parameters.local = 'true';
			} else {
				const version = rollupVersion || rollupRequest?.version;
				if (version) {
					parameters.version = version;
				}
			}

			const json = JSON.stringify({
				example: selectedExample,
				modules,
				options
			});

			parameters.shareable = btoa(encodeURIComponent(json));
			const queryString = Object.keys(parameters)
				.map(key => `${key}=${parameters[key]}`)
				.join('&');
			const url = `?${queryString}`;
			history.replaceState({}, '', url);
		},
		{ deep: true }
	);
}
