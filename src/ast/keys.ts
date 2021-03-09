import { GenericEsTreeNode } from './nodes/shared/Node';

export const keys: {
	[name: string]: string[];
} = {
	Literal: [],
	Program: ['body']
};

export function getAndCreateKeys(esTreeNode: GenericEsTreeNode) {
	keys[esTreeNode.type] = Object.keys(esTreeNode).filter(
		key => key !== '_rollupAnnotations' && typeof esTreeNode[key] === 'object'
	);
	return keys[esTreeNode.type];
}
