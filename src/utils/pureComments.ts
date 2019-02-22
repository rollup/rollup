import * as acorn from 'acorn';
// @ts-ignore
import { base as basicWalker } from 'acorn-walk';
import * as ESTree from 'estree';
import { CommentDescription } from '../Module';

type NodeHandler = (node: ESTree.Node, comment: CommentDescription) => void;

function checkCommentsBeforeNode(
	node: ESTree.Node & acorn.Node,
	state: { handleNode: NodeHandler; commentIndex: number; commentNodes: CommentDescription[] },
	type: string = node.type
) {
	let commentNode = state.commentNodes[state.commentIndex];
	while (commentNode && node.start >= commentNode.end) {
		state.handleNode(node, commentNode);
		commentNode = state.commentNodes[++state.commentIndex];
	}
	if (commentNode && commentNode.end <= node.end) {
		basicWalker[type](node, state, checkCommentsBeforeNode);
	}
}

function markPureNode(
	node: ESTree.Node & { annotations?: CommentDescription[] },
	comment: CommentDescription
) {
	if (node.annotations) {
		node.annotations.push(comment);
	} else {
		node.annotations = [comment];
	}
	if (node.type === 'ExpressionStatement') {
		node = node.expression;
	}
	if (node.type === 'CallExpression' || node.type === 'NewExpression') {
		(<any>node).annotatedPure = true;
	}
}

const pureCommentRegex = /[@#]__PURE__/;
const isPureComment = (comment: CommentDescription) => pureCommentRegex.test(comment.text);

export function markPureCallExpressions(comments: CommentDescription[], esTreeAst: ESTree.Program) {
	checkCommentsBeforeNode(<any>esTreeAst, {
		commentNodes: comments.filter(isPureComment),
		commentIndex: 0,
		handleNode: markPureNode
	});
}
