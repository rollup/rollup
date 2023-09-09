import type { GenericEsTreeNode } from './nodes/shared/Node';

export const keys: {
	[name: string]: string[];
} = {
	Literal: [],
	Program: ['body']
};

export function createKeysForNode(esTreeNode: GenericEsTreeNode): string[] {
	return Object.keys(esTreeNode).filter(
		key => typeof esTreeNode[key] === 'object' && key.charCodeAt(0) !== 95 /* _ */
	);
}
