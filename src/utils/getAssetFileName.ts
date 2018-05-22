import { extname } from './path';
import { isPlainName } from './relativeId';
import error from './error';
import { makeUnique, renderNamePattern } from './renderNamePattern';
import sha256 from 'hash.js/lib/hash/sha/256';

export function getAssetFileName(
	assetName: string,
	source: string | Buffer,
	existingNames: Record<string, any>,
	assetFileNames: string
) {
	if (typeof assetName !== 'string' || !isPlainName(assetName))
		error({
			code: 'INVALID_ASSET_NAME',
			message: `Plugin error creating asset, name is not a plain (non relative or absolute URL) string name.`
		});
	if (source === undefined)
		error({
			code: 'MISSING_ASSET_SOURCE',
			message: `Plugin error creating asset ${assetName} The asset source must always be provided in order to support hash file names for assets.`
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
					return assetName.substr(0, assetName.length - extname(assetName).length);
				case 'ext':
					return extname(assetName);
			}
		}),
		existingNames
	);
}
