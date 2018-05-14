import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';
import MagicString from 'magic-string';

const globalImportMetaUrlMechanism = `(typeof document !== 'undefined' ? document.currentScript && document.currentScript.src || location.href : new URL('file:' + __filename).href)`;
const importMetaUrlMechanisms: Record<string, string> = {
	amd: `new URL(module.uri.startsWith('file:') ? module.uri : 'file:' + module.uri).href`,
	cjs: `new (typeof URL !== 'undefined' ? URL : require('url').URL)('file:' + __filename).href`,
	iife: globalImportMetaUrlMechanism,
	umd: globalImportMetaUrlMechanism
};

export default class MetaProperty extends NodeBase {
	type: NodeType.tMetaProperty;
	meta: Identifier;
	property: Identifier;

	renderImportMetaMechanism(
		code: MagicString,
		importMetaProperty: string,
		format: string
	): string | void {
		if (format === 'system') code.overwrite(this.meta.start, this.meta.end, 'module');
		else if (importMetaProperty === 'url') return importMetaUrlMechanisms[format];
	}
}
