import * as acorn from 'acorn';
import { base as basicWalker, BaseWalker } from 'acorn-walk';
import {
	CallExpression,
	ChainExpression,
	ExpressionStatement,
	NewExpression
} from '../ast/nodes/NodeType';
import { Annotation } from '../ast/nodes/shared/Node';

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
	commentIndex: number;
	commentNodes: acorn.Comment[];
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
	node: acorn.Node & { _rollupAnnotations?: Annotation[] },
	comment: acorn.Comment
) {
	if (node._rollupAnnotations) {
		node._rollupAnnotations.push({ comment });
	} else {
		node._rollupAnnotations = [{ comment }];
	}
	while (node.type === ExpressionStatement || node.type === ChainExpression) {
		node = (node as any).expression;
	}
	if (node.type === CallExpression || node.type === NewExpression) {
		if (node._rollupAnnotations) {
			node._rollupAnnotations.push({ pure: true });
		} else {
			node._rollupAnnotations = [{ pure: true }];
		}
	}
}

const pureCommentRegex = /[@#]__PURE__/;
const isPureComment = (comment: acorn.Comment) => pureCommentRegex.test(comment.value);

export function markPureCallExpressions(comments: acorn.Comment[], esTreeAst: acorn.Node) {
	handlePureAnnotationsOfNode(esTreeAst, {
		commentIndex: 0,
		commentNodes: comments.filter(isPureComment)
	});
}
