import MagicString from 'magic-string';
import { accessedFileUrlGlobals, accessedMetaUrlGlobals } from '../../utils/defaultPlugin';
import { dirname, normalize, relative } from '../../utils/path';
import { PluginDriver } from '../../utils/pluginDriver';
import { ObjectPathKey } from '../utils/PathTracker';
import Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

const ASSET_PREFIX = 'ROLLUP_ASSET_URL_';
const CHUNK_PREFIX = 'ROLLUP_CHUNK_URL_';
const FILE_PREFIX = 'ROLLUP_FILE_URL_';

export default class MetaProperty extends NodeBase {
	meta!: Identifier;
	property!: Identifier;
	type!: NodeType.tMetaProperty;

	private metaProperty?: string | null;

	hasEffects(): boolean {
		return false;
	}

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
				if (
					metaProperty.startsWith(FILE_PREFIX) ||
					metaProperty.startsWith(ASSET_PREFIX) ||
					metaProperty.startsWith(CHUNK_PREFIX)
				) {
					this.scope.addAccessedGlobalsByFormat(accessedFileUrlGlobals);
				} else {
					this.scope.addAccessedGlobalsByFormat(accessedMetaUrlGlobals);
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
		const metaProperty = this.metaProperty as string | null;

		if (
			metaProperty &&
			(metaProperty.startsWith(FILE_PREFIX) ||
				metaProperty.startsWith(ASSET_PREFIX) ||
				metaProperty.startsWith(CHUNK_PREFIX))
		) {
			let referenceId: string | null = null;
			let assetReferenceId: string | null = null;
			let chunkReferenceId: string | null = null;
			let fileName: string;
			if (metaProperty.startsWith(FILE_PREFIX)) {
				referenceId = metaProperty.substr(FILE_PREFIX.length);
				fileName = this.context.getFileName(referenceId);
			} else if (metaProperty.startsWith(ASSET_PREFIX)) {
				this.context.warnDeprecation(
					`Using the "${ASSET_PREFIX}" prefix to reference files is deprecated. Use the "${FILE_PREFIX}" prefix instead.`,
					false
				);
				assetReferenceId = metaProperty.substr(ASSET_PREFIX.length);
				fileName = this.context.getFileName(assetReferenceId);
			} else {
				this.context.warnDeprecation(
					`Using the "${CHUNK_PREFIX}" prefix to reference files is deprecated. Use the "${FILE_PREFIX}" prefix instead.`,
					false
				);
				chunkReferenceId = metaProperty.substr(CHUNK_PREFIX.length);
				fileName = this.context.getFileName(chunkReferenceId);
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
						referenceId: referenceId || assetReferenceId || (chunkReferenceId as string),
						relativePath
					}
				]);
			}

			code.overwrite(
				(parent as MemberExpression).start,
				(parent as MemberExpression).end,
				replacement,
				{ contentOnly: true }
			);
			return;
		}

		const replacement = pluginDriver.hookFirstSync('resolveImportMeta', [
			metaProperty,
			{
				chunkId,
				format,
				moduleId: this.context.module.id
			}
		]);
		if (typeof replacement === 'string') {
			if (parent instanceof MemberExpression) {
				code.overwrite(parent.start, parent.end, replacement, { contentOnly: true });
			} else {
				code.overwrite(this.start, this.end, replacement, { contentOnly: true });
			}
		}
	}
}
