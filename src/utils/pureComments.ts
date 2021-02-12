import * as acorn from 'acorn';
import { base as basicWalker, BaseWalker } from 'acorn-walk';
import { CommentDescription } from '../Module';

// patch up acorn-walk until class-fields are officially supported
basicWalker.PropertyDefinition = function (node: any, st: any, c: any) {
	if (node.computed) {
		c(node.key, st, 'Expression');
	}
	if (node.value) {
		c(node.value, st, 'Expression');
	}
};

interface CommentState {
	commentIndex: number; commentNodes: CommentDescription[]
}

function handlePureAnnotationsOfNode(
	node: acorn.Node,
	state: CommentState,
	type: string = node.type
) {
	let commentNode = state.commentNodes[state.commentIndex];
	while (commentNode && node.start >= commentNode.end) {
		markPureNode(node, commentNode);
		commentNode = state.commentNodes[++state.commentIndex];
	}
	if (commentNode && commentNode.end <= node.end) {
		(basicWalker as BaseWalker<CommentState>)[type](node, state, handlePureAnnotationsOfNode);
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
