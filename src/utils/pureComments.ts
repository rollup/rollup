// @ts-ignore
import walk from 'acorn/dist/walk';
import * as ESTree from 'estree';
import { CommentDescription } from '../Module';

type ESTreeNodeWithLocation = ESTree.Node & { start: number; end: number };
type NodeHandler = (node: ESTree.Node) => void;

function checkCommentsBeforeNode(
	node: ESTreeNodeWithLocation,
	st: { handleNode: NodeHandler; commentIdx: number; commentNodes: CommentDescription[] }
) {
	if (st.commentIdx === st.commentNodes.length || st.commentNodes[st.commentIdx].end > node.end)
		return;
	let isFound = false;
	while (
		st.commentIdx < st.commentNodes.length &&
		node.start >= st.commentNodes[st.commentIdx].end
	) {
		if (!isFound) {
			st.handleNode(node);
			isFound = true;
		}
		st.commentIdx++;
	}
	walk.base[node.type](node, st, checkCommentsBeforeNode);
}

function forEachNodeAfterComment(
	ast: ESTree.Program,
	commentNodes: CommentDescription[],
	handleNode: NodeHandler
): void {
	checkCommentsBeforeNode(<any>ast, { commentNodes, commentIdx: 0, handleNode });
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
