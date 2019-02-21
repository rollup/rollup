import * as acorn from 'acorn';
// @ts-ignore
import { base as basicWalker } from 'acorn-walk';
import * as ESTree from 'estree';
import { CommentDescription } from '../Module';

type NodeHandler = (node: ESTree.Node) => void;

function checkCommentsBeforeNode(
	node: ESTree.Node & acorn.Node,
	state: { handleNode: NodeHandler; commentIndex: number; commentNodes: CommentDescription[] },
	type: string = node.type
) {
	if (
		state.commentIndex === state.commentNodes.length ||
		state.commentNodes[state.commentIndex].end > node.end
	)
		return;
	let isFound = false;
	while (
		state.commentIndex < state.commentNodes.length &&
		node.start >= state.commentNodes[state.commentIndex].end
	) {
		if (!isFound) {
			state.handleNode(node);
			isFound = true;
		}
		state.commentIndex++;
	}
	basicWalker[type](node, state, checkCommentsBeforeNode);
}

function forEachNodeAfterComment(
	ast: ESTree.Program,
	commentNodes: CommentDescription[],
	handleNode: NodeHandler
): void {
	checkCommentsBeforeNode(<any>ast, { commentNodes, commentIndex: 0, handleNode });
}

function markPureNode(node: ESTree.Node) {
	if (node.type === 'ExpressionStatement') {
		node = node.expression;
	}
	if (node.type === 'CallExpression' || node.type === 'NewExpression') {
		(<any>node).annotatedPure = true;
	}
}

const pureCommentRegex = /[@#]__PURE__/;

export function markPureCallExpressions(comments: CommentDescription[], esTreeAst: ESTree.Program) {
	forEachNodeAfterComment(
		esTreeAst,
		comments.filter(comment => pureCommentRegex.test(comment.text)),
		markPureNode
	);
}
