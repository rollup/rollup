import type { OutputAsset, OutputBundle, OutputChunk } from '../rollup/types';

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

export const removeUnreferencedAssets = (outputBundle: OutputBundleWithPlaceholders) => {
	const unreferencedAssets = new Set<string>();
	const bundleEntries = Object.values(outputBundle);

	for (const asset of bundleEntries) {
		if (asset.type === 'asset' && asset.needsCodeReference) {
			unreferencedAssets.add(asset.fileName);
		}
	}

	for (const chunk of bundleEntries) {
		if (chunk.type === 'chunk') {
			for (const referencedFile of chunk.referencedFiles) {
				if (unreferencedAssets.has(referencedFile)) {
					unreferencedAssets.delete(referencedFile);
				}
			}
		}
	}

	for (const file of unreferencedAssets) {
		delete outputBundle[file];
	}
};
