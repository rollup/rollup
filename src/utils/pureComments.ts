import * as acorn from 'acorn';
import { BaseWalker, base as basicWalker } from 'acorn-walk';
import { ChainExpression, ExpressionStatement } from '../ast/nodes/NodeType';

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
	code: string;
	commentIndex: number;
	commentNodes: acorn.Comment[];
}

function isOnlyWhitespaceOrComments(code: string) {
	// streamline the typical case
	if (/^\s*$/.test(code)) return true;
	try {
		// successful only if it's a valid Program without statements
		const ast = acorn.parse(code, { ecmaVersion: 'latest' }) as any;
		return ast.body && ast.body.length === 0;
	} catch {
		// should only be reached by invalid annotations like:
		//
		//   foo() /*@__PURE__*/ /* other */, bar();
		//
		// where `code` is " /* other */, "
	}
	return false;
}

function handlePureAnnotationsOfNode(
	node: acorn.Node,
	state: CommentState,
	type: string = node.type
) {
	let commentNode = state.commentNodes[state.commentIndex];
	while (commentNode && node.start >= commentNode.end) {
		const between = state.code.substring(commentNode.end, node.start);
		if (isOnlyWhitespaceOrComments(between)) markPureNode(node, commentNode);
		commentNode = state.commentNodes[++state.commentIndex];
	}
	if (commentNode && commentNode.end <= node.end) {
		(basicWalker as BaseWalker<CommentState>)[type](node, state, handlePureAnnotationsOfNode);
	}
}

function markPureNode(
	node: acorn.Node & { _rollupAnnotations?: acorn.Comment[] },
	comment: acorn.Comment
) {
	const annotatedNodes = [];
	while (true) {
		annotatedNodes.push(node);
		switch (node.type) {
			case ExpressionStatement:
			case ChainExpression:
				node = (node as any).expression;
				continue;
			// case SequenceExpression:
			// 	// TODO Lukas check of parens
			// 	console.log(
			// 		'associate sequence expression',
			// 		node.start,
			// 		(node as any).expressions[0].start
			// 	);
			// 	node = (node as any).expressions[0];
			// 	continue;
			// case CallExpression:
			// case NewExpression:
			// 	// TODO Lukas those are good ones
			// 	break;
			// default:
			// TODO Lukas here, just remove all annotated nodes and mark the comment as to be removed
		}
		// TODO Lukas collect them and add them to "always removed code"
		break;
	}
	for (const node of annotatedNodes) {
		if (node._rollupAnnotations) {
			node._rollupAnnotations.push(comment);
		} else {
			node._rollupAnnotations = [comment];
		}
	}
}

const pureCommentRegex = /[@#]__PURE__/;
const isPureComment = (comment: acorn.Comment) => pureCommentRegex.test(comment.value);

export function markPureCallExpressions(
	comments: acorn.Comment[],
	esTreeAst: acorn.Node,
	code: string
): void {
	handlePureAnnotationsOfNode(esTreeAst, {
		code,
		commentIndex: 0,
		commentNodes: comments.filter(isPureComment)
	});
}
