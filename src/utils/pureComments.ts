import * as acorn from 'acorn';
import { BaseWalker, base as basicWalker } from 'acorn-walk';
import {
	BinaryExpression,
	CallExpression,
	ChainExpression,
	ConditionalExpression,
	ExpressionStatement,
	LogicalExpression,
	NewExpression,
	SequenceExpression
} from '../ast/nodes/NodeType';
import { SOURCEMAPPING_URL_RE } from './sourceMappingURL';

// patch up acorn-walk until class-fields are officially supported
basicWalker.PropertyDefinition = function (node: any, st: any, c: any): void {
	if (node.computed) {
		c(node.key, st, 'Expression');
	}
	if (node.value) {
		c(node.value, st, 'Expression');
	}
};

interface CommentState {
	annotationIndex: number;
	annotations: acorn.Comment[];
	code: string;
}

export const ANNOTATION_KEY = '_rollupAnnotations';
export const INVALID_COMMENT_KEY = '_rollupRemoved';

interface NodeWithComments extends acorn.Node {
	[ANNOTATION_KEY]?: acorn.Comment[];
	[INVALID_COMMENT_KEY]?: acorn.Comment[];
}

function handlePureAnnotationsOfNode(
	node: acorn.Node,
	state: CommentState,
	type: string = node.type
): void {
	const { annotations } = state;
	let comment = annotations[state.annotationIndex];
	while (comment && node.start >= comment.end) {
		markPureNode(node, comment, state.code);
		comment = annotations[++state.annotationIndex];
	}
	if (comment && comment.end <= node.end) {
		(basicWalker as BaseWalker<CommentState>)[type](node, state, handlePureAnnotationsOfNode);
		while ((comment = annotations[state.annotationIndex]) && comment.end <= node.end) {
			++state.annotationIndex;
			annotateNode(node, comment, false);
		}
	}
}

const neitherWithespaceNorBrackets = /[^\s(]/g;
const noWhitespace = /\S/g;

function markPureNode(node: NodeWithComments, comment: acorn.Comment, code: string): void {
	const annotatedNodes = [];
	let invalidAnnotation: boolean | undefined;
	const codeInBetween = code.slice(comment.end, node.start);
	if (doesNotMatchOutsideComment(codeInBetween, neitherWithespaceNorBrackets)) {
		const parentStart = node.start;
		while (true) {
			annotatedNodes.push(node);
			switch (node.type) {
				case ExpressionStatement:
				case ChainExpression:
					node = (node as any).expression;
					continue;
				case SequenceExpression:
					// if there are parentheses, the annotation would apply to the entire expression
					if (doesNotMatchOutsideComment(code.slice(parentStart, node.start), noWhitespace)) {
						node = (node as any).expressions[0];
						continue;
					}
					invalidAnnotation = true;
					break;
				case ConditionalExpression:
					// if there are parentheses, the annotation would apply to the entire expression
					if (doesNotMatchOutsideComment(code.slice(parentStart, node.start), noWhitespace)) {
						node = (node as any).test;
						continue;
					}
					invalidAnnotation = true;
					break;
				case LogicalExpression:
				case BinaryExpression:
					// if there are parentheses, the annotation would apply to the entire expression
					if (doesNotMatchOutsideComment(code.slice(parentStart, node.start), noWhitespace)) {
						node = (node as any).left;
						continue;
					}
					invalidAnnotation = true;
					break;
				case CallExpression:
				case NewExpression:
					break;
				default:
					invalidAnnotation = true;
			}
			break;
		}
	} else {
		invalidAnnotation = true;
	}
	if (invalidAnnotation) {
		annotateNode(node, comment, false);
	} else {
		for (const node of annotatedNodes) {
			annotateNode(node, comment, true);
		}
	}
}

function doesNotMatchOutsideComment(code: string, forbiddenChars: RegExp): boolean {
	let nextMatch: RegExpExecArray | null;
	while ((nextMatch = forbiddenChars.exec(code)) !== null) {
		if (nextMatch[0] === '/') {
			const charCodeAfterSlash = code.charCodeAt(forbiddenChars.lastIndex);
			if (charCodeAfterSlash === 42 /*"*"*/) {
				forbiddenChars.lastIndex = code.indexOf('*/', forbiddenChars.lastIndex + 1) + 2;
				continue;
			} else if (charCodeAfterSlash === 47 /*"/"*/) {
				forbiddenChars.lastIndex = code.indexOf('\n', forbiddenChars.lastIndex + 1) + 1;
				continue;
			}
		}
		forbiddenChars.lastIndex = 0;
		return false;
	}
	return true;
}

const pureCommentRegex = /[@#]__PURE__/;

export function addAnnotations(
	comments: acorn.Comment[],
	esTreeAst: acorn.Node,
	code: string
): void {
	const annotations: acorn.Comment[] = [];
	const sourceMappingComments: acorn.Comment[] = [];
	for (const comment of comments) {
		if (pureCommentRegex.test(comment.value)) {
			annotations.push(comment);
		} else if (SOURCEMAPPING_URL_RE.test(comment.value)) {
			sourceMappingComments.push(comment);
		}
	}
	for (const comment of sourceMappingComments) {
		annotateNode(esTreeAst, comment, false);
	}
	handlePureAnnotationsOfNode(esTreeAst, {
		annotationIndex: 0,
		annotations,
		code
	});
}

function annotateNode(node: NodeWithComments, comment: acorn.Comment, valid: boolean): void {
	const key = valid ? ANNOTATION_KEY : INVALID_COMMENT_KEY;
	const property = node[key];
	if (property) {
		property.push(comment);
	} else {
		node[key] = [comment];
	}
}
