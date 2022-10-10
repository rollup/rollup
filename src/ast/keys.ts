import type { GenericEsTreeNode } from './nodes/shared/Node';

export const keys: {
	[name: string]: string[];
} = {
	// TODO this should be removed once ImportExpression follows official ESTree
	//  specs with "null" as default
	ImportExpression: ['arguments'],
	Literal: [],
	Program: ['body']
};

export function getAndCreateKeys(esTreeNode: GenericEsTreeNode): string[] {
	keys[esTreeNode.type] = Object.keys(esTreeNode).filter(
		key => typeof esTreeNode[key] === 'object' && key.charCodeAt(0) !== 95 /* _ */
	);
	return keys[esTreeNode.type];
}
