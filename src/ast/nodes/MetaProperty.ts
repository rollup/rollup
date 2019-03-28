import MagicString from 'magic-string';
import { dirname, normalize, relative } from '../../utils/path';
import { RenderOptions } from '../../utils/renderHelpers';
import Identifier from './Identifier';
import Literal from './Literal';
import MemberExpression from './MemberExpression';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

// TODO Lukas extract more common elements from mechanisms
// TODO Lukas reference absolute mechanism in relative mechanism

const globalImportMetaUrlMechanism = (_: string) =>
	`(typeof document${_}!==${_}'undefined'${_}?${_}document.currentScript${_}&&${_}document.currentScript.src${_}||${_}document.baseURI${_}:${_}new${_}(typeof URL${_}!==${_}'undefined'${_}?${_}URL${_}:${_}require('ur'+'l').URL)('file:'${_}+${_}__filename).href)`;

const importMetaUrlMechanisms: Record<string, (_: string) => string> = {
	amd: (_: string) =>
		`new URL((typeof process${_}!==${_}'undefined'${_}&&${_}process.versions${_}&&${_}process.versions.node${_}?${_}'file:'${_}:${_}'')${_}+${_}module.uri).href`,
	cjs: (_: string) =>
		`new${_}(typeof URL${_}!==${_}'undefined'${_}?${_}URL${_}:${_}require('ur'+'l').URL)((process.browser${_}?${_}''${_}:${_}'file:')${_}+${_}__filename,${_}process.browser${_}&&${_}document.baseURI).href`,
	iife: globalImportMetaUrlMechanism,
	umd: globalImportMetaUrlMechanism
};

const globalRelUrlMechanism = (relPath: string, _: string) => {
	return `new${_}(typeof URL${_}!==${_}'undefined'${_}?${_}URL${_}:${_}require('ur'+'l').URL)((typeof document${_}!==${_}'undefined'${_}?${_}document.currentScript${_}&&${_}document.currentScript.src${_}||${_}document.baseURI${_}:${_}'file:'${_}+${_}__filename)${_}+${_}'/../${relPath}').href`;
};

const relUrlMechanisms: Record<string, (relPath: string, _: string) => string> = {
	amd: (relPath: string, _: string) =>
		`new URL((typeof process${_}!==${_}'undefined'${_}&&${_}process.versions${_}&&${_}process.versions.node${_}?${_}'file:'${_}:${_}'')${_}+${_}module.uri${_}+${_}'/../${relPath}').href`,
	cjs: (relPath: string, _: string) =>
		`new${_}(typeof URL${_}!==${_}'undefined'${_}?${_}URL${_}:${_}require('ur'+'l').URL)((process.browser${_}?${_}''${_}:${_}'file:')${_}+${_}__dirname${_}+${_}'/${relPath}',${_}process.browser${_}&&${_}document.baseURI).href`,
	es: (relPath: string, _: string) => `new URL('../${relPath}',${_}import.meta.url).href`,
	iife: globalRelUrlMechanism,
	system: (relPath: string, _: string) => `new URL('../${relPath}',${_}module.url).href`,
	umd: globalRelUrlMechanism
};

export default class MetaProperty extends NodeBase {
	meta: Identifier;
	property: Identifier;
	rendered: boolean;
	type: NodeType.tMetaProperty;

	initialise() {
		if (this.meta.name === 'import') {
			this.rendered = false;
			this.context.addImportMeta(this);
		}
		this.included = false;
	}

	render(code: MagicString, options: RenderOptions) {
		if (this.meta.name === 'import') this.rendered = true;
		super.render(code, options);
	}

	renderFinalMechanism(
		code: MagicString,
		chunkId: string,
		format: string,
		compact: boolean
	): boolean {
		// TODO Lukas why?
		if (!this.rendered) return false;

		const _ = compact ? '' : ' ';
		if (this.parent instanceof MemberExpression === false) return false;

		const parent = <MemberExpression>this.parent;

		let importMetaProperty: string;
		if (parent.property instanceof Identifier) importMetaProperty = parent.property.name;
		else if (parent.property instanceof Literal && typeof parent.property.value === 'string')
			importMetaProperty = parent.property.value;
		else return false;

		// support import.meta.ROLLUP_ASSET_URL_[ID]
		if (importMetaProperty.startsWith('ROLLUP_ASSET_URL_')) {
			const assetFileName = this.context.getAssetFileName(importMetaProperty.substr(17));
			const relPath = normalize(relative(dirname(chunkId), assetFileName));
			code.overwrite(parent.start, parent.end, relUrlMechanisms[format](relPath, _));
			return true;
		}

		if (format === 'system') {
			code.overwrite(this.meta.start, this.meta.end, 'module');
		} else if (importMetaProperty === 'url') {
			const importMetaUrlMechanism = importMetaUrlMechanisms[format];
			if (importMetaUrlMechanism)
				code.overwrite(parent.start, parent.end, importMetaUrlMechanism(_));
			return true;
		}

		return false;
	}
}
