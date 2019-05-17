import * as acorn from 'acorn';
// @ts-ignore
import { base as basicWalker } from 'acorn-walk';
import * as ESTree from 'estree';
import { CommentDescription } from '../Module';

function handlePureAnnotationsOfNode(
	node: ESTree.Node & acorn.Node,
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
		(node as any).annotatedPure = true;
	}
}

const pureCommentRegex = /[@#]__PURE__/;
const isPureComment = (comment: CommentDescription) => pureCommentRegex.test(comment.text);

export function markPureCallExpressions(comments: CommentDescription[], esTreeAst: ESTree.Program) {
	handlePureAnnotationsOfNode(esTreeAst as any, {
		commentIndex: 0,
		commentNodes: comments.filter(isPureComment)
	});
}
