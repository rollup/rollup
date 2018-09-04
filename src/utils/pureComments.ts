// @ts-ignore
import walk from 'acorn/dist/walk';
import * as ESTree from 'estree';
import { CommentDescription } from '../Module';

function forEachNodeAfterComment(
	ast: ESTree.Program,
	commentNodes: CommentDescription[],
	handleNode: (node: ESTree.Node) => void
): void {
	let commentIdx = 0;

	checkCommentsBeforeNode(<any>ast);

	function checkCommentsBeforeNode(node: ESTree.Node & { start: number; end: number }) {
		if (commentIdx === commentNodes.length || commentNodes[commentIdx].end > node.end) return;
		let isFound = false;
		while (commentIdx < commentNodes.length && node.start >= commentNodes[commentIdx].end) {
			if (!isFound) {
				handleNode(node);
				isFound = true;
			}
			commentIdx++;
		}
		walk.base[node.type](node, null, checkCommentsBeforeNode);
	}
}

function markPureNode(node: ESTree.Node) {
	while (node.type === 'ExpressionStatement') {
		node = node.expression;
	}
	if (node.type === 'CallExpression') {
		(<any>node).pure = true;
	}
}

const pureCommentRegex = /^ ?#__PURE__\s*$/;

export function markPureCallExpressions(comments: CommentDescription[], esTreeAst: ESTree.Program) {
	forEachNodeAfterComment(
		esTreeAst,
		comments.filter(comment => pureCommentRegex.test(comment.text)),
		markPureNode
	);
}
