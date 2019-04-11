import MagicString from 'magic-string';
import { dirname, normalize, relative } from '../../utils/path';
import { PluginDriver } from '../../utils/pluginDriver';
import Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

const getResolveUrl = (path: string, URL: string = 'URL') => `new ${URL}(${path}).href`;

const amdModuleUrl = `(typeof process !== 'undefined' && process.versions && process.versions.node ? 'file:' : '') + module.uri`;

const globalRelUrlMechanism = (relPath: string) => {
	return getResolveUrl(
		`(typeof document !== 'undefined' ? document.currentScript && document.currentScript.src || document.baseURI : 'file:' + __filename) + '/../${relPath}'`,
		`(typeof URL !== 'undefined' ? URL : require('ur'+'l').URL)`
	);
};

const relUrlMechanisms: Record<string, (relPath: string) => string> = {
	amd: (relPath: string) => getResolveUrl(`${amdModuleUrl} + '/../${relPath}'`),
	cjs: (relPath: string) =>
		getResolveUrl(
			`(process.browser ? '' : 'file:') + __dirname + '/${relPath}', process.browser && document.baseURI`,
			`(typeof URL !== 'undefined' ? URL : require('ur'+'l').URL)`
		),
	es: (relPath: string) => getResolveUrl(`'../${relPath}', import.meta.url`),
	iife: globalRelUrlMechanism,
	system: (relPath: string) => getResolveUrl(`'../${relPath}', module.url`),
	umd: globalRelUrlMechanism
};

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

		// support import.meta.ROLLUP_ASSET_URL_[ID]
		if (importMetaProperty && importMetaProperty.startsWith('ROLLUP_ASSET_URL_')) {
			const assetFileName = this.context.getAssetFileName(importMetaProperty.substr(17));
			const relPath = normalize(relative(dirname(chunkId), assetFileName));
			code.overwrite(
				(parent as MemberExpression).start,
				(parent as MemberExpression).end,
				relUrlMechanisms[format](relPath)
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
