import { OutputAsset, OutputBundle, OutputChunk } from '../rollup/types';

export const lowercaseBundleKeys = Symbol('bundleKeys');

export const FILE_PLACEHOLDER = {
	type: 'placeholder' as const
};

export interface OutputBundleWithPlaceholders {
	[fileName: string]: OutputAsset | OutputChunk | typeof FILE_PLACEHOLDER;
	[lowercaseBundleKeys]: Set<string>;
}

export const getOutputBundle = (outputBundleBase: OutputBundle): OutputBundleWithPlaceholders => {
	const reservedLowercaseBundleKeys = new Set<string>();
	return new Proxy(outputBundleBase, {
		deleteProperty(target, key) {
			if (typeof key === 'string') {
				reservedLowercaseBundleKeys.delete(key.toLowerCase());
			}
			return Reflect.deleteProperty(target, key);
		},
		get(target, key) {
			if (key === lowercaseBundleKeys) {
				return reservedLowercaseBundleKeys;
			}
			return Reflect.get(target, key);
		},
		set(target, key, value) {
			if (typeof key === 'string') {
				reservedLowercaseBundleKeys.add(key.toLowerCase());
			}
			return Reflect.set(target, key, value);
		}
	}) as OutputBundleWithPlaceholders;
};
