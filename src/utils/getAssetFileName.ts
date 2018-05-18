import { OutputBundle } from '../rollup/types';
import { extname } from './path';
import { isPlainName } from './relativeId';
import error from './error';
import { makeUnique, renderNamePattern } from './renderNamePattern';
import sha256 from 'hash.js/lib/hash/sha/256';

export default (outputBundle: OutputBundle, assetFileNames = 'assets/[name]-[hash][ext]') => {
	return function getAssetFileName(assetName: string, source: string | Buffer) {
		if (source === undefined)
			error({
				code: 'MISSING_ASSET_SOURCE',
				message: `Plugin error calling getAssetFileName: The asset source must always be provided in order to support hash file names for assets.`
			});
		if (typeof assetName !== 'string' || !isPlainName(assetName))
			error({
				code: 'INVALID_ASSET_NAME',
				message: `Plugin error calling getAssetFileName: Asset name "${assetName}" is not a plain (non relative or absolute URL) string name.`
			});
		const ext = extname(assetName);
		if (!ext)
			error({
				code: 'INVALID_ASSET_NAME',
				message: `Plugin error calling getAssetFileName: Asset name "${assetName}" must include a file extension.`
			});

		return makeUnique(
			renderNamePattern(assetFileNames, 'assetFileNames', name => {
				switch (name) {
					case 'hash':
						const hash = sha256();
						hash.update(name);
						hash.update(':');
						hash.update(source);
						return hash.digest('hex').substr(0, 8);
					case 'name':
						return assetName.substr(0, assetName.length - ext.length);
					case 'ext':
						return ext;
				}
			}),
			outputBundle
		);
	};
};
