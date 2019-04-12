import MagicString from 'magic-string';
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

		// TODO Lukas extract, use same hook
		if (importMetaProperty && importMetaProperty.startsWith(ASSET_PREFIX)) {
			const assetFileName = this.context.getAssetFileName(
				importMetaProperty.substr(ASSET_PREFIX.length)
			);
			const relativeAssetPath = normalize(relative(dirname(chunkId), assetFileName));
			const replacement = pluginDriver.hookFirstSync<string>('resolveAssetUrl', [
				{
					assetFileName,
					chunkId,
					format,
					moduleId: this.context.module.id,
					relativeAssetPath
				}
			]);

			code.overwrite(
				(parent as MemberExpression).start,
				(parent as MemberExpression).end,
				replacement
			);
			return true;
		}

		if (importMetaProperty && importMetaProperty.startsWith(CHUNK_PREFIX)) {
			const chunkFileName = this.context.getChunkFileName(
				importMetaProperty.substr(CHUNK_PREFIX.length)
			);
			const relativeChunkPath = normalize(relative(dirname(chunkId), chunkFileName));
			const replacement = pluginDriver.hookFirstSync<string>('resolveChunkUrl', [
				{
					chunkFileName,
					chunkId,
					format,
					moduleId: this.context.module.id,
					relativeChunkPath
				}
			]);

			code.overwrite(
				(parent as MemberExpression).start,
				(parent as MemberExpression).end,
				replacement
			);
			return true;
		}

		const replacement = pluginDriver.hookFirstSync<string | void>('resolveImportMeta', [
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
