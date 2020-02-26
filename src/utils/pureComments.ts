import * as acorn from 'acorn';
// @ts-ignore
import { base as basicWalker } from 'acorn-walk';
import { CommentDescription } from '../Module';

function handlePureAnnotationsOfNode(
	node: acorn.Node,
	state: { commentIndex: number; commentNodes: CommentDescription[] },
	type: string = node.type
) {
	let commentNode = state.commentNodes[state.commentIndex];
	while (commentNode && node.start >= commentNode.end) {
		markPureNode(node, commentNode);
		commentNode = state.commentNodes[++state.commentIndex];
	}
	if (commentNode && commentNode.end <= node.end) {
		basicWalker[type](node, state, handlePureAnnotationsOfNode);
	}
}

function markPureNode(
	node: acorn.Node & { annotations?: CommentDescription[] },
	comment: CommentDescription
) {
	if (node.annotations) {
		node.annotations.push(comment);
	} else {
		node.annotations = [comment];
	}
	if (node.type === 'ExpressionStatement') {
		node = (node as any).expression;
	}
	if (node.type === 'CallExpression' || node.type === 'NewExpression') {
		(node as any).annotatedPure = true;
	}
}

const pureCommentRegex = /[@#]__PURE__/;
const isPureComment = (comment: CommentDescription) => pureCommentRegex.test(comment.text);

export function markPureCallExpressions(comments: CommentDescription[], esTreeAst: acorn.Node) {
	handlePureAnnotationsOfNode(esTreeAst, {
		commentIndex: 0,
		commentNodes: comments.filter(isPureComment)
	});
}
