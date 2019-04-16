import MagicString from 'magic-string';
import { EmittedFileType } from '../../rollup/types';
import { dirname, normalize, relative } from '../../utils/path';
import { PluginDriver } from '../../utils/pluginDriver';
import Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

const ASSET_PREFIX = 'ROLLUP_ASSET_URL_';
const CHUNK_PREFIX = 'ROLLUP_CHUNK_URL_';

export default class MetaProperty extends NodeBase {
	meta: Identifier;
	property: Identifier;
	type: NodeType.tMetaProperty;

	initialise() {
		if (this.meta.name === 'import') {
			this.context.addImportMeta(this);
		}
		this.included = false;
	}

	renderFinalMechanism(
		code: MagicString,
		chunkId: string,
		format: string,
		pluginDriver: PluginDriver
	): boolean {
		if (!this.included) return false;
		const parent = this.parent;
		const importMetaProperty =
			parent instanceof MemberExpression && typeof parent.propertyKey === 'string'
				? parent.propertyKey
				: null;

		// TODO Lukas duplicate asset tests with new hook
		if (
			importMetaProperty &&
			(importMetaProperty.startsWith(ASSET_PREFIX) || importMetaProperty.startsWith(CHUNK_PREFIX))
		) {
			const [type, fileName]: [EmittedFileType, string] = importMetaProperty.startsWith(
				ASSET_PREFIX
			)
				? ['ASSET', this.context.getAssetFileName(importMetaProperty.substr(ASSET_PREFIX.length))]
				: ['CHUNK', this.context.getChunkFileName(importMetaProperty.substr(CHUNK_PREFIX.length))];

			const relativePath = normalize(relative(dirname(chunkId), fileName));
			let replacement;
			if (type === 'ASSET') {
				// deprecated hook for assets
				replacement = pluginDriver.hookFirstSync('resolveAssetUrl', [
					{
						assetFileName: fileName,
						chunkId,
						format,
						moduleId: this.context.module.id,
						relativeAssetPath: relativePath
					}
				]);
			}
			if (!replacement) {
				replacement = pluginDriver.hookFirstSync<'resolveFileUrl', string>('resolveFileUrl', [
					{
						chunkId,
						fileName,
						format,
						moduleId: this.context.module.id,
						relativePath,
						type
					}
				]);
			}

			code.overwrite(
				(parent as MemberExpression).start,
				(parent as MemberExpression).end,
				replacement
			);
			return true;
		}

		const replacement = pluginDriver.hookFirstSync('resolveImportMeta', [
			importMetaProperty,
			{
				chunkId,
				format,
				moduleId: this.context.module.id
			}
		]);
		if (typeof replacement === 'string') {
			if (parent instanceof MemberExpression) {
				code.overwrite(parent.start, parent.end, replacement);
			} else {
				code.overwrite(this.start, this.end, replacement);
			}
			return true;
		}
		return false;
	}
}
