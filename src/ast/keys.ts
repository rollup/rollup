import { GenericEsTreeNode } from './nodes/shared/Node';

export const keys: {
	[name: string]: string[];
} = {
	Program: ['body'],
	Literal: []
};

export function getAndCreateKeys(esTreeNode: GenericEsTreeNode) {
	keys[esTreeNode.type] = Object.keys(esTreeNode).filter(
		key => typeof esTreeNode[key] === 'object'
	);
	return keys[esTreeNode.type];
}
