import MagicString from 'magic-string';
import { accessedFileUrlGlobals, accessedMetaUrlGlobals } from '../../utils/defaultPlugin';
import { dirname, normalize, relative } from '../../utils/path';
import { PluginDriver } from '../../utils/pluginDriver';
import { ObjectPathKey } from '../values';
import Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

const ASSET_PREFIX = 'ROLLUP_ASSET_URL_';
const CHUNK_PREFIX = 'ROLLUP_CHUNK_URL_';

export default class MetaProperty extends NodeBase {
	meta!: Identifier;
	property!: Identifier;
	type!: NodeType.tMetaProperty;

	private metaProperty?: string | null;

	hasEffectsWhenAccessedAtPath(path: ObjectPathKey[]): boolean {
		return path.length > 1;
	}

	include() {
		if (!this.included) {
			this.included = true;
			const parent = this.parent;
			const metaProperty = (this.metaProperty =
				parent instanceof MemberExpression && typeof parent.propertyKey === 'string'
					? parent.propertyKey
					: null);
			if (metaProperty) {
				if (metaProperty === 'url') {
					this.scope.addAccessedGlobalsByFormat(accessedMetaUrlGlobals);
				} else if (metaProperty.startsWith(ASSET_PREFIX) || metaProperty.startsWith(CHUNK_PREFIX)) {
					this.scope.addAccessedGlobalsByFormat(accessedFileUrlGlobals);
				}
			}
		}
	}

	initialise() {
		if (this.meta.name === 'import') {
			this.context.addImportMeta(this);
		}
	}

	renderFinalMechanism(
		code: MagicString,
		chunkId: string,
		format: string,
		pluginDriver: PluginDriver
	): void {
		if (!this.included) return;
		const parent = this.parent;
		const importMetaProperty = this.metaProperty as string | null;

		if (
			importMetaProperty &&
			(importMetaProperty.startsWith(ASSET_PREFIX) || importMetaProperty.startsWith(CHUNK_PREFIX))
		) {
			let assetReferenceId: string | null = null;
			let chunkReferenceId: string | null = null;
			let fileName: string;
			if (importMetaProperty.startsWith(ASSET_PREFIX)) {
				assetReferenceId = importMetaProperty.substr(ASSET_PREFIX.length);
				fileName = this.context.getAssetFileName(assetReferenceId);
			} else {
				chunkReferenceId = importMetaProperty.substr(CHUNK_PREFIX.length);
				fileName = this.context.getChunkFileName(chunkReferenceId);
			}
			const relativePath = normalize(relative(dirname(chunkId), fileName));
			let replacement;
			if (assetReferenceId !== null) {
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
						assetReferenceId,
						chunkId,
						chunkReferenceId,
						fileName,
						format,
						moduleId: this.context.module.id,
						relativePath
					}
				]);
			}

			code.overwrite(
				(parent as MemberExpression).start,
				(parent as MemberExpression).end,
				replacement
			);
			return;
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
		}
	}
}
