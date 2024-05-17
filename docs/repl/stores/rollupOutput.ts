import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type {
	LogLevel,
	OutputOptions,
	RollupError,
	RollupLog,
	RollupOptions,
	RollupOutput
} from '../../../src/rollup/types';
import type { Module } from '../../types';
import { getFileNameFromMessage } from '../helpers/messages';
import { dirname, resolve } from '../helpers/path';
import { useModules } from './modules';
import { useOptions } from './options';
import type { RequestedRollupInstance } from './rollup';
import { useRollup } from './rollup';

interface GeneratedRollupOutput {
	error: RollupError | null;
	externalImports: string[];
	logs: [LogLevel, RollupLog][];
	output: RollupOutput['output'] | never[];
}

interface BundleRequest {
	modules: Module[];
	options: OutputOptions;
	rollup: RequestedRollupInstance;
	setOutput(output: GeneratedRollupOutput): void;
}

function logWarning(message: RollupLog) {
	console.group(getFileNameFromMessage(message) || 'general error');
	console.warn(message.stack || message.message, { ...message });
	console.groupEnd();
}

function hashOptionsAndRollupVersion({ options, rollup: { instance } }: BundleRequest) {
	return JSON.stringify({ o: options, v: instance?.VERSION });
}

const LEADING_SLASH_REGEX = /^[/\\]/;

async function bundle({ rollup: { instance }, modules, options, setOutput }: BundleRequest) {
	if (modules.length === 0 || !instance) {
		return;
	}
	if (import.meta.env.PROD) {
		console.clear();
	}
	console.group(`running Rollup version ${instance.VERSION}`);

	const modulesById = new Map<string, Module>();
	for (const module of modules) {
		modulesById.set(module.name, module);
	}

	const logs: [LogLevel, RollupLog][] = [];
	const externalImports = new Set<string>();

	const rollupOptions: RollupOptions = {
		...options,
		input: modules.filter((module, index) => index === 0 || module.isEntry).map(({ name }) => name),
		onLog(level, log) {
			logs.push([level, log]);
		},
		plugins: [
			{
				buildStart() {
					externalImports.clear();
				},
				load(id) {
					return (modulesById.get(id) || modulesById.get(id.replace(LEADING_SLASH_REGEX, '')))
						?.code;
				},
				name: 'browser-resolve',
				resolveId(importee, importer) {
					if (!importer) {
						return resolve('/', importee);
					}
					if (importee[0] !== '.') {
						externalImports.add(importee);
						return false;
					}

					let resolved = resolve('/', dirname(importer), importee);
					if (modulesById.has(resolved.replace(LEADING_SLASH_REGEX, ''))) return resolved;

					resolved += '.js';
					if (modulesById.has(resolved.replace(LEADING_SLASH_REGEX, ''))) return resolved;

					throw new Error(`Could not resolve '${importee}' from '${importer}'.`);
				}
			}
		]
	};

	console.log('%coptions:', 'font-weight: bold; color: blue', rollupOptions);
	try {
		const generated = await (
			await instance.rollup(rollupOptions)
		).generate((rollupOptions as { output?: OutputOptions }).output || {});
		console.log('%coutput:', 'font-weight: bold; color: green', generated.output);
		setOutput({
			error: null,
			externalImports: [...externalImports].sort((a, b) => (a < b ? -1 : 1)),
			logs,
			output: generated.output
		});
	} catch (error) {
		console.log(
			'%cerror:',
			'font-weight: bold; color: red',
			error,
			JSON.parse(JSON.stringify(error))
		);
		setOutput({ error: error as Error, externalImports: [], logs, output: [] });
		logWarning(error as Error);
	}
	console.groupEnd();
}

export const useRollupOutput = defineStore('rollupOutput', () => {
	const rollupStore = useRollup();
	const modulesStore = useModules();
	const optionsStore = useOptions();
	const output = ref<GeneratedRollupOutput>({
		error: null,
		externalImports: [],
		logs: [],
		output: []
	});
	let bundleDebounceTimeout: ReturnType<typeof setTimeout> | undefined;
	let nextBundleRequest: BundleRequest | null = null;
	let completedRequestHash = '';

	// TODO instead of debouncing we should bundle in a worker
	function requestBundle(bundleRequest: BundleRequest) {
		// We are currently bundling, queue this request for when we are done
		if (nextBundleRequest) {
			nextBundleRequest = bundleRequest;
			return;
		}
		// Otherwise, restart the debounce-timeout
		clearTimeout(bundleDebounceTimeout);
		if (bundleRequest.rollup.error) {
			bundleRequest.setOutput({
				error: bundleRequest.rollup.error,
				externalImports: [],
				logs: [],
				output: []
			});
			return;
		}
		if (!bundleRequest.rollup.instance) {
			return;
		}
		bundleDebounceTimeout = setTimeout(
			async () => {
				nextBundleRequest = bundleRequest;
				await bundle(bundleRequest);
				completedRequestHash = hashOptionsAndRollupVersion(bundleRequest);
				const currentBundleRequest = nextBundleRequest;
				nextBundleRequest = null;
				if (currentBundleRequest !== bundleRequest) {
					requestBundle(currentBundleRequest);
				}
			},
			// Do not debounce on Rollup version or options change
			completedRequestHash === hashOptionsAndRollupVersion(bundleRequest) ? 100 : 0
		);
	}

	watch(
		[() => rollupStore.loaded, () => modulesStore.modules, () => optionsStore.optionsObject as any],
		([rollup, modules, options]) =>
			requestBundle({
				modules,
				options,
				rollup,
				setOutput(value: GeneratedRollupOutput) {
					output.value = value;
				}
			}),
		{ deep: true }
	);
	return { output };
});
