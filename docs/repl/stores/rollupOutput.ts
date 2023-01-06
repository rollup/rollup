import type { RequestedRollupInstance } from './rollup';
import { useRollup } from './rollup';
import type { Module } from './modules';
import { useModules } from './modules';
import { useOptions } from './options';
import { dirname, resolve } from '../helpers/path';
import { getFileNameFromMessage } from '../helpers/messages';
import { defineStore } from 'pinia';
import type {
	OutputOptions,
	RollupError,
	RollupOptions,
	RollupOutput,
	RollupWarning
} from 'rollup';
import { ref, watch } from 'vue';

interface GeneratedRollupOutput {
	error: RollupError | null;
	output: RollupOutput['output'] | never[];
	warnings: RollupWarning[];
}

interface BundleRequest {
	modules: Module[];
	options: OutputOptions;
	rollup: RequestedRollupInstance;
	setOutput(output: GeneratedRollupOutput): void;
}

function logWarning(message: RollupWarning) {
	console.group(getFileNameFromMessage(message) || '');
	console.warn(message);
	console.groupEnd();
}

function hashOptionsAndRollupVersion({ options, rollup: { version } }: BundleRequest) {
	return JSON.stringify({ o: options, v: version });
}

async function bundle({ rollup: { rollup, version }, modules, options, setOutput }: BundleRequest) {
	if (modules.length === 0 || !rollup) {
		return;
	}
	console.clear();
	console.log(`running Rollup version %c${version}`, 'font-weight: bold');

	const modulesById = new Map<string, Module>();
	for (const module of modules) {
		modulesById.set(module.name, module);
	}

	const warnings: RollupWarning[] = [];
	const inputOptions: RollupOptions = {
		onwarn(warning) {
			warnings.push(warning);
			logWarning(warning);
		},
		plugins: [
			{
				load(id) {
					return modulesById.get(id)?.code;
				},
				name: 'browser-resolve',
				resolveId(importee, importer) {
					if (!importer) return importee;
					if (importee[0] !== '.') return false;

					let resolved = resolve(dirname(importer), importee).replace(/^\.\//, '');
					if (modulesById.has(resolved)) return resolved;

					resolved += '.js';
					if (modulesById.has(resolved)) return resolved;

					throw new Error(`Could not resolve '${importee}' from '${importer}'.`);
				}
			}
		]
	};
	inputOptions.input = modules
		.filter((module, index) => index === 0 || module.isEntry)
		.map(module => module.name);

	try {
		const generated = await (await rollup(inputOptions)).generate(options);
		setOutput({
			error: null,
			output: generated.output,
			warnings
		});
	} catch (error) {
		setOutput({ error: error as Error, output: [], warnings });
		logWarning({ ...(error as Error) });
	}
}

export const useRollupOutput = defineStore('rollupOutput', () => {
	const rollupStore = useRollup();
	const modulesStore = useModules();
	const optionsStore = useOptions();
	const output = ref<GeneratedRollupOutput>({
		error: null,
		output: [],
		warnings: []
	});
	let bundleDebounceTimeout: number | undefined;
	let nextBundleRequest: BundleRequest | null = null;
	let completedRequestHash = '';

	// TODO instead of debouncing we should bundle in a worker
	function requestBundle(bundleRequest: BundleRequest) {
		// We are currently bundling, queue this request for when we are done
		if (nextBundleRequest) {
			nextBundleRequest = bundleRequest;
			return;
		}
		// Otherwise, restart the debounce timeout
		clearTimeout(bundleDebounceTimeout);
		if (bundleRequest.rollup.error) {
			bundleRequest.setOutput({
				error: bundleRequest.rollup.error,
				output: [],
				warnings: []
			});
			return;
		}
		if (!bundleRequest.rollup.rollup) {
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
		[() => rollupStore.rollup, () => modulesStore.modules, () => optionsStore.options],
		([rollup, modules, options]: any) =>
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
