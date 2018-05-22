import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';
import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import Literal from './Literal';
import MemberExpression from './MemberExpression';
import { dirname, relative, normalize } from '../../utils/path';

const globalImportMetaUrlMechanism = `(typeof document !== 'undefined' ? document.currentScript && document.currentScript.src || document.baseURI : new (typeof URL !== 'undefined' ? URL : require('ur'+'l').URL)('file:' + __filename).href)`;
const importMetaUrlMechanisms: Record<string, string> = {
	amd: `new URL((typeof process !== 'undefined' && process.versions && process.versions.node ? 'file:' : '') + module.uri).href`,
	cjs: `new (typeof URL !== 'undefined' ? URL : require('ur'+'l').URL)((process.browser ? 'file:' : '') + __filename, process.browser && document.baseURI).href`,
	iife: globalImportMetaUrlMechanism,
	umd: globalImportMetaUrlMechanism
};

const globalRelUrlMechanism = (relPath: string) =>
	`new (typeof URL !== 'undefined' ? URL : require('ur'+'l').URL)((typeof document !== 'undefined' ? document.currentScript && document.currentScript.src || document.baseURI : 'file:' + __filename) + '/../${relPath}').href`;
const relUrlMechanisms: Record<string, (relPath: string) => string> = {
	amd: (relPath: string) =>
		`new URL((typeof process !== 'undefined' && process.versions && process.versions.node ? 'file:' : '') + module.uri + '/../${relPath}').href`,
	cjs: (relPath: string) =>
		`new (typeof URL !== 'undefined' ? URL : require('ur'+'l').URL)((process.browser ? 'file:' : '') + __dirname + '/${relPath}', process.browser && document.baseURI).href`,
	iife: globalRelUrlMechanism,
	umd: globalRelUrlMechanism
};

export default class MetaProperty extends NodeBase {
	type: NodeType.tMetaProperty;
	meta: Identifier;
	property: Identifier;
	rendered = false;

	initialise() {
		this.context.addImportMeta(this);
		this.included = false;
	}

	render(code: MagicString, options: RenderOptions) {
		this.rendered = true;
		super.render(code, options);
	}

	renderFinalMechanism(code: MagicString, chunkId: string, format: string): boolean {
		if (!this.rendered) return false;

		if (this.parent instanceof MemberExpression === false) return false;

		const parent = <MemberExpression>this.parent;

		let importMetaProperty: string;
		if (parent.property instanceof Identifier) importMetaProperty = this.property.name;
		else if (parent.property instanceof Literal && typeof parent.property.value === 'string')
			importMetaProperty = parent.property.value;
		else return false;

		// support import.meta.ROLLUP_ASSET_URL_[ID]
		if (importMetaProperty.startsWith('ROLLUP_ASSET_URL_')) {
			const assetFileName = this.context.getAssetFileName(importMetaProperty.substr(17));
			const relPath = normalize(relative(dirname(chunkId), assetFileName));
			code.overwrite(parent.start, parent.end, relUrlMechanisms[format](relPath));
			return false;
		}

		if (format === 'system') {
			code.overwrite(this.meta.start, this.meta.end, 'module');
		} else if (importMetaProperty === 'url') {
			const importMetaUrlMechanism = importMetaUrlMechanisms[format];
			code.overwrite(parent.start, parent.end, importMetaUrlMechanism);
			return true;
		}

		return false;
	}
}
