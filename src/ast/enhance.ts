import nodes from './nodes/index';
import UnknownNode from './nodes/UnknownNode';
import keys from './keys';
import { Node } from './nodes/shared/Node';
import Module from '../Module';
import MagicString from 'magic-string';
import Import from './nodes/Import';

export default function enhance(ast: any, module: Module, dynamicImportReturnList: Import[]) {
	enhanceNode(ast, {}, module, module.magicString, dynamicImportReturnList);

	for (const node of ast.body) {
		node.initialise(module.scope);
	}
}

function isArrayOfNodes(raw: Node | Node[]): raw is Node[] {
	return 'length' in raw;
}

function enhanceNode(
	raw: Node | Node[],
	parent: Node | {},
	module: Module,
	code: MagicString,
	dynamicImportReturnList: Import[]
) {
	if (!raw) return;

	if (isArrayOfNodes(raw)) {
		for (let i = 0; i < raw.length; i += 1) {
			enhanceNode(raw[i], parent, module, code, dynamicImportReturnList);
		}
		return;
	}

	const rawNode = raw;

	// with e.g. shorthand properties, key and value are
	// the same node. We don't want to enhance an object twice
	if (rawNode.__enhanced) return;
	rawNode.__enhanced = true;

	if (!keys[rawNode.type]) {
		keys[rawNode.type] = Object.keys(rawNode).filter(key => typeof (<any>rawNode)[key] === 'object');
	}

	rawNode.parent = parent;
	rawNode.module = module;
	rawNode.keys = keys[rawNode.type];

	code.addSourcemapLocation(rawNode.start);
	code.addSourcemapLocation(rawNode.end);

	for (const key of keys[rawNode.type]) {
		enhanceNode((<any>rawNode)[key], rawNode, module, code, dynamicImportReturnList);
	}

	const type = nodes[rawNode.type] || UnknownNode;
	(<any>rawNode).__proto__ = type.prototype;

	if (type === Import) {
		dynamicImportReturnList.push(<Import>rawNode);
	}
}
