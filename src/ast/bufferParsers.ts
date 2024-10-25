// This file is generated by scripts/generate-buffer-parsers.js.
// Do not edit this file directly.

import type * as estree from 'estree';
import type { AstContext } from '../Module';
import { convertAnnotations } from '../utils/astConverterHelpers';
import { EMPTY_ARRAY } from '../utils/blank';
import { convertNode as convertJsonNode } from '../utils/bufferToAst';
import FIXED_STRINGS from '../utils/convert-ast-strings';
import type { AstBuffer } from '../utils/getAstBuffer';
import { getAstBuffer } from '../utils/getAstBuffer';
import ArrayExpression from './nodes/ArrayExpression';
import ArrayPattern from './nodes/ArrayPattern';
import ArrowFunctionExpression from './nodes/ArrowFunctionExpression';
import AssignmentExpression from './nodes/AssignmentExpression';
import AssignmentPattern from './nodes/AssignmentPattern';
import AwaitExpression from './nodes/AwaitExpression';
import BinaryExpression from './nodes/BinaryExpression';
import BlockStatement from './nodes/BlockStatement';
import BreakStatement from './nodes/BreakStatement';
import CallExpression from './nodes/CallExpression';
import CatchClause from './nodes/CatchClause';
import ChainExpression from './nodes/ChainExpression';
import ClassBody from './nodes/ClassBody';
import ClassDeclaration from './nodes/ClassDeclaration';
import ClassExpression from './nodes/ClassExpression';
import ConditionalExpression from './nodes/ConditionalExpression';
import ContinueStatement from './nodes/ContinueStatement';
import DebuggerStatement from './nodes/DebuggerStatement';
import Decorator from './nodes/Decorator';
import DoWhileStatement from './nodes/DoWhileStatement';
import EmptyStatement from './nodes/EmptyStatement';
import ExportAllDeclaration from './nodes/ExportAllDeclaration';
import ExportDefaultDeclaration from './nodes/ExportDefaultDeclaration';
import ExportNamedDeclaration from './nodes/ExportNamedDeclaration';
import ExportSpecifier from './nodes/ExportSpecifier';
import ExpressionStatement from './nodes/ExpressionStatement';
import ForInStatement from './nodes/ForInStatement';
import ForOfStatement from './nodes/ForOfStatement';
import ForStatement from './nodes/ForStatement';
import FunctionDeclaration from './nodes/FunctionDeclaration';
import FunctionExpression from './nodes/FunctionExpression';
import Identifier from './nodes/Identifier';
import IfStatement from './nodes/IfStatement';
import ImportAttribute from './nodes/ImportAttribute';
import ImportDeclaration from './nodes/ImportDeclaration';
import ImportDefaultSpecifier from './nodes/ImportDefaultSpecifier';
import ImportExpression from './nodes/ImportExpression';
import ImportNamespaceSpecifier from './nodes/ImportNamespaceSpecifier';
import ImportSpecifier from './nodes/ImportSpecifier';
import JSXAttribute from './nodes/JSXAttribute';
import JSXClosingElement from './nodes/JSXClosingElement';
import JSXClosingFragment from './nodes/JSXClosingFragment';
import JSXElement from './nodes/JSXElement';
import JSXEmptyExpression from './nodes/JSXEmptyExpression';
import JSXExpressionContainer from './nodes/JSXExpressionContainer';
import JSXFragment from './nodes/JSXFragment';
import JSXIdentifier from './nodes/JSXIdentifier';
import JSXMemberExpression from './nodes/JSXMemberExpression';
import JSXNamespacedName from './nodes/JSXNamespacedName';
import JSXOpeningElement from './nodes/JSXOpeningElement';
import JSXOpeningFragment from './nodes/JSXOpeningFragment';
import JSXSpreadAttribute from './nodes/JSXSpreadAttribute';
import JSXSpreadChild from './nodes/JSXSpreadChild';
import JSXText from './nodes/JSXText';
import LabeledStatement from './nodes/LabeledStatement';
import Literal from './nodes/Literal';
import LogicalExpression from './nodes/LogicalExpression';
import MemberExpression from './nodes/MemberExpression';
import MetaProperty from './nodes/MetaProperty';
import MethodDefinition from './nodes/MethodDefinition';
import NewExpression from './nodes/NewExpression';
import ObjectExpression from './nodes/ObjectExpression';
import ObjectPattern from './nodes/ObjectPattern';
import PanicError from './nodes/PanicError';
import ParseError from './nodes/ParseError';
import PrivateIdentifier from './nodes/PrivateIdentifier';
import Program from './nodes/Program';
import Property from './nodes/Property';
import PropertyDefinition from './nodes/PropertyDefinition';
import RestElement from './nodes/RestElement';
import ReturnStatement from './nodes/ReturnStatement';
import SequenceExpression from './nodes/SequenceExpression';
import SpreadElement from './nodes/SpreadElement';
import StaticBlock from './nodes/StaticBlock';
import Super from './nodes/Super';
import SwitchCase from './nodes/SwitchCase';
import SwitchStatement from './nodes/SwitchStatement';
import TaggedTemplateExpression from './nodes/TaggedTemplateExpression';
import TemplateElement from './nodes/TemplateElement';
import TemplateLiteral from './nodes/TemplateLiteral';
import ThisExpression from './nodes/ThisExpression';
import ThrowStatement from './nodes/ThrowStatement';
import TryStatement from './nodes/TryStatement';
import UnaryExpression from './nodes/UnaryExpression';
import UpdateExpression from './nodes/UpdateExpression';
import VariableDeclaration from './nodes/VariableDeclaration';
import VariableDeclarator from './nodes/VariableDeclarator';
import WhileStatement from './nodes/WhileStatement';
import YieldExpression from './nodes/YieldExpression';
import { UNKNOWN_EXPRESSION } from './nodes/shared/Expression';
import type { Node, NodeBase } from './nodes/shared/Node';
import type ChildScope from './scopes/ChildScope';
import type ModuleScope from './scopes/ModuleScope';
import TrackingScope from './scopes/TrackingScope';
import type ParameterVariable from './variables/ParameterVariable';

export function convertProgram(
	buffer: Buffer | Uint8Array,
	parent: Node | { context: AstContext; type: string },
	parentScope: ModuleScope
): Program {
	return convertNode(parent, parentScope, 0, getAstBuffer(buffer));
}

const nodeTypeStrings = [
	'PanicError',
	'ParseError',
	'ArrayExpression',
	'ArrayPattern',
	'ArrowFunctionExpression',
	'AssignmentExpression',
	'AssignmentPattern',
	'AwaitExpression',
	'BinaryExpression',
	'BlockStatement',
	'BreakStatement',
	'CallExpression',
	'CatchClause',
	'ChainExpression',
	'ClassBody',
	'ClassDeclaration',
	'ClassExpression',
	'ConditionalExpression',
	'ContinueStatement',
	'DebuggerStatement',
	'Decorator',
	'ExpressionStatement',
	'DoWhileStatement',
	'EmptyStatement',
	'ExportAllDeclaration',
	'ExportDefaultDeclaration',
	'ExportNamedDeclaration',
	'ExportSpecifier',
	'ExpressionStatement',
	'ForInStatement',
	'ForOfStatement',
	'ForStatement',
	'FunctionDeclaration',
	'FunctionExpression',
	'Identifier',
	'IfStatement',
	'ImportAttribute',
	'ImportDeclaration',
	'ImportDefaultSpecifier',
	'ImportExpression',
	'ImportNamespaceSpecifier',
	'ImportSpecifier',
	'JSXAttribute',
	'JSXClosingElement',
	'JSXClosingFragment',
	'JSXElement',
	'JSXEmptyExpression',
	'JSXExpressionContainer',
	'JSXFragment',
	'JSXIdentifier',
	'JSXMemberExpression',
	'JSXNamespacedName',
	'JSXOpeningElement',
	'JSXOpeningFragment',
	'JSXSpreadAttribute',
	'JSXSpreadChild',
	'JSXText',
	'LabeledStatement',
	'Literal',
	'Literal',
	'Literal',
	'Literal',
	'Literal',
	'Literal',
	'LogicalExpression',
	'MemberExpression',
	'MetaProperty',
	'MethodDefinition',
	'NewExpression',
	'ObjectExpression',
	'ObjectPattern',
	'PrivateIdentifier',
	'Program',
	'Property',
	'PropertyDefinition',
	'RestElement',
	'ReturnStatement',
	'SequenceExpression',
	'SpreadElement',
	'StaticBlock',
	'Super',
	'SwitchCase',
	'SwitchStatement',
	'TaggedTemplateExpression',
	'TemplateElement',
	'TemplateLiteral',
	'ThisExpression',
	'ThrowStatement',
	'TryStatement',
	'UnaryExpression',
	'UpdateExpression',
	'VariableDeclaration',
	'VariableDeclarator',
	'WhileStatement',
	'YieldExpression'
] as const;

const nodeConstructors: (typeof NodeBase)[] = [
	PanicError,
	ParseError,
	ArrayExpression,
	ArrayPattern,
	ArrowFunctionExpression,
	AssignmentExpression,
	AssignmentPattern,
	AwaitExpression,
	BinaryExpression,
	BlockStatement,
	BreakStatement,
	CallExpression,
	CatchClause,
	ChainExpression,
	ClassBody,
	ClassDeclaration,
	ClassExpression,
	ConditionalExpression,
	ContinueStatement,
	DebuggerStatement,
	Decorator,
	ExpressionStatement,
	DoWhileStatement,
	EmptyStatement,
	ExportAllDeclaration,
	ExportDefaultDeclaration,
	ExportNamedDeclaration,
	ExportSpecifier,
	ExpressionStatement,
	ForInStatement,
	ForOfStatement,
	ForStatement,
	FunctionDeclaration,
	FunctionExpression,
	Identifier,
	IfStatement,
	ImportAttribute,
	ImportDeclaration,
	ImportDefaultSpecifier,
	ImportExpression,
	ImportNamespaceSpecifier,
	ImportSpecifier,
	JSXAttribute,
	JSXClosingElement,
	JSXClosingFragment,
	JSXElement,
	JSXEmptyExpression,
	JSXExpressionContainer,
	JSXFragment,
	JSXIdentifier,
	JSXMemberExpression,
	JSXNamespacedName,
	JSXOpeningElement,
	JSXOpeningFragment,
	JSXSpreadAttribute,
	JSXSpreadChild,
	JSXText,
	LabeledStatement,
	Literal,
	Literal,
	Literal,
	Literal,
	Literal,
	Literal,
	LogicalExpression,
	MemberExpression,
	MetaProperty,
	MethodDefinition,
	NewExpression,
	ObjectExpression,
	ObjectPattern,
	PrivateIdentifier,
	Program,
	Property,
	PropertyDefinition,
	RestElement,
	ReturnStatement,
	SequenceExpression,
	SpreadElement,
	StaticBlock,
	Super,
	SwitchCase,
	SwitchStatement,
	TaggedTemplateExpression,
	TemplateElement,
	TemplateLiteral,
	ThisExpression,
	ThrowStatement,
	TryStatement,
	UnaryExpression,
	UpdateExpression,
	VariableDeclaration,
	VariableDeclarator,
	WhileStatement,
	YieldExpression
];

const bufferParsers: ((node: any, position: number, buffer: AstBuffer) => void)[] = [
	function panicError(node: PanicError, position, buffer) {
		node.message = buffer.convertString(buffer[position]);
	},
	function parseError(node: ParseError, position, buffer) {
		node.message = buffer.convertString(buffer[position]);
	},
	function arrayExpression(node: ArrayExpression, position, buffer) {
		const { scope } = node;
		node.elements = convertNodeList(node, scope, buffer[position], buffer);
	},
	function arrayPattern(node: ArrayPattern, position, buffer) {
		const { scope } = node;
		node.elements = convertNodeList(node, scope, buffer[position], buffer);
	},
	function arrowFunctionExpression(node: ArrowFunctionExpression, position, buffer) {
		const { scope } = node;
		const flags = buffer[position];
		node.async = (flags & 1) === 1;
		node.expression = (flags & 2) === 2;
		node.generator = (flags & 4) === 4;
		const annotations = (node.annotations = convertAnnotations(buffer[position + 1], buffer));
		node.annotationNoSideEffects = annotations.some(comment => comment.type === 'noSideEffects');
		const parameters = (node.params = convertNodeList(node, scope, buffer[position + 2], buffer));
		scope.addParameterVariables(
			parameters.map(
				parameter => parameter.declare('parameter', UNKNOWN_EXPRESSION) as ParameterVariable[]
			),
			parameters[parameters.length - 1] instanceof RestElement
		);
		node.body = convertNode(node, scope.bodyScope, buffer[position + 3], buffer);
	},
	function assignmentExpression(node: AssignmentExpression, position, buffer) {
		const { scope } = node;
		node.operator = FIXED_STRINGS[buffer[position]] as estree.AssignmentOperator;
		node.left = convertNode(node, scope, buffer[position + 1], buffer);
		node.right = convertNode(node, scope, buffer[position + 2], buffer);
	},
	function assignmentPattern(node: AssignmentPattern, position, buffer) {
		const { scope } = node;
		node.left = convertNode(node, scope, buffer[position], buffer);
		node.right = convertNode(node, scope, buffer[position + 1], buffer);
	},
	function awaitExpression(node: AwaitExpression, position, buffer) {
		const { scope } = node;
		node.argument = convertNode(node, scope, buffer[position], buffer);
	},
	function binaryExpression(node: BinaryExpression, position, buffer) {
		const { scope } = node;
		node.operator = FIXED_STRINGS[buffer[position]] as estree.BinaryOperator;
		node.left = convertNode(node, scope, buffer[position + 1], buffer);
		node.right = convertNode(node, scope, buffer[position + 2], buffer);
	},
	function blockStatement(node: BlockStatement, position, buffer) {
		const { scope } = node;
		node.body = convertNodeList(node, scope, buffer[position], buffer);
	},
	function breakStatement(node: BreakStatement, position, buffer) {
		const { scope } = node;
		const labelPosition = buffer[position];
		node.label = labelPosition === 0 ? null : convertNode(node, scope, labelPosition, buffer);
	},
	function callExpression(node: CallExpression, position, buffer) {
		const { scope } = node;
		const flags = buffer[position];
		node.optional = (flags & 1) === 1;
		node.annotations = convertAnnotations(buffer[position + 1], buffer);
		node.callee = convertNode(node, scope, buffer[position + 2], buffer);
		node.arguments = convertNodeList(node, scope, buffer[position + 3], buffer);
	},
	function catchClause(node: CatchClause, position, buffer) {
		const { scope } = node;
		const parameterPosition = buffer[position];
		const parameter = (node.param =
			parameterPosition === 0 ? null : convertNode(node, scope, parameterPosition, buffer));
		parameter?.declare('parameter', UNKNOWN_EXPRESSION);
		node.body = convertNode(node, scope.bodyScope, buffer[position + 1], buffer);
	},
	function chainExpression(node: ChainExpression, position, buffer) {
		const { scope } = node;
		node.expression = convertNode(node, scope, buffer[position], buffer);
	},
	function classBody(node: ClassBody, position, buffer) {
		const { scope } = node;
		const bodyPosition = buffer[position];
		const body: (MethodDefinition | PropertyDefinition)[] = (node.body = []);
		if (bodyPosition) {
			const length = buffer[bodyPosition];
			for (let index = 0; index < length; index++) {
				const nodePosition = buffer[bodyPosition + 1 + index];
				body.push(
					convertNode(
						node,
						(buffer[nodePosition + 3] & 1) === 0 ? scope.instanceScope : scope,
						nodePosition,
						buffer
					)
				);
			}
		}
	},
	function classDeclaration(node: ClassDeclaration, position, buffer) {
		const { scope } = node;
		node.decorators = convertNodeList(node, scope, buffer[position], buffer);
		const idPosition = buffer[position + 1];
		node.id =
			idPosition === 0 ? null : convertNode(node, scope.parent as ChildScope, idPosition, buffer);
		const superClassPosition = buffer[position + 2];
		node.superClass =
			superClassPosition === 0 ? null : convertNode(node, scope, superClassPosition, buffer);
		node.body = convertNode(node, scope, buffer[position + 3], buffer);
	},
	function classExpression(node: ClassExpression, position, buffer) {
		const { scope } = node;
		node.decorators = convertNodeList(node, scope, buffer[position], buffer);
		const idPosition = buffer[position + 1];
		node.id = idPosition === 0 ? null : convertNode(node, scope, idPosition, buffer);
		const superClassPosition = buffer[position + 2];
		node.superClass =
			superClassPosition === 0 ? null : convertNode(node, scope, superClassPosition, buffer);
		node.body = convertNode(node, scope, buffer[position + 3], buffer);
	},
	function conditionalExpression(node: ConditionalExpression, position, buffer) {
		const { scope } = node;
		node.test = convertNode(node, scope, buffer[position], buffer);
		node.consequent = convertNode(node, scope, buffer[position + 1], buffer);
		node.alternate = convertNode(node, scope, buffer[position + 2], buffer);
	},
	function continueStatement(node: ContinueStatement, position, buffer) {
		const { scope } = node;
		const labelPosition = buffer[position];
		node.label = labelPosition === 0 ? null : convertNode(node, scope, labelPosition, buffer);
	},
	function debuggerStatement() {},
	function decorator(node: Decorator, position, buffer) {
		const { scope } = node;
		node.expression = convertNode(node, scope, buffer[position], buffer);
	},
	function directive(node: ExpressionStatement, position, buffer) {
		const { scope } = node;
		node.directive = buffer.convertString(buffer[position]);
		node.expression = convertNode(node, scope, buffer[position + 1], buffer);
	},
	function doWhileStatement(node: DoWhileStatement, position, buffer) {
		const { scope } = node;
		node.body = convertNode(node, scope, buffer[position], buffer);
		node.test = convertNode(node, scope, buffer[position + 1], buffer);
	},
	function emptyStatement() {},
	function exportAllDeclaration(node: ExportAllDeclaration, position, buffer) {
		const { scope } = node;
		const exportedPosition = buffer[position];
		node.exported =
			exportedPosition === 0 ? null : convertNode(node, scope, exportedPosition, buffer);
		node.source = convertNode(node, scope, buffer[position + 1], buffer);
		node.attributes = convertNodeList(node, scope, buffer[position + 2], buffer);
	},
	function exportDefaultDeclaration(node: ExportDefaultDeclaration, position, buffer) {
		const { scope } = node;
		node.declaration = convertNode(node, scope, buffer[position], buffer);
	},
	function exportNamedDeclaration(node: ExportNamedDeclaration, position, buffer) {
		const { scope } = node;
		node.specifiers = convertNodeList(node, scope, buffer[position], buffer);
		const sourcePosition = buffer[position + 1];
		node.source = sourcePosition === 0 ? null : convertNode(node, scope, sourcePosition, buffer);
		node.attributes = convertNodeList(node, scope, buffer[position + 2], buffer);
		const declarationPosition = buffer[position + 3];
		node.declaration =
			declarationPosition === 0 ? null : convertNode(node, scope, declarationPosition, buffer);
	},
	function exportSpecifier(node: ExportSpecifier, position, buffer) {
		const { scope } = node;
		node.local = convertNode(node, scope, buffer[position], buffer);
		const exportedPosition = buffer[position + 1];
		node.exported =
			exportedPosition === 0 ? node.local : convertNode(node, scope, exportedPosition, buffer);
	},
	function expressionStatement(node: ExpressionStatement, position, buffer) {
		const { scope } = node;
		node.expression = convertNode(node, scope, buffer[position], buffer);
	},
	function forInStatement(node: ForInStatement, position, buffer) {
		const { scope } = node;
		node.left = convertNode(node, scope, buffer[position], buffer);
		node.right = convertNode(node, scope, buffer[position + 1], buffer);
		node.body = convertNode(node, scope, buffer[position + 2], buffer);
	},
	function forOfStatement(node: ForOfStatement, position, buffer) {
		const { scope } = node;
		const flags = buffer[position];
		node.await = (flags & 1) === 1;
		node.left = convertNode(node, scope, buffer[position + 1], buffer);
		node.right = convertNode(node, scope, buffer[position + 2], buffer);
		node.body = convertNode(node, scope, buffer[position + 3], buffer);
	},
	function forStatement(node: ForStatement, position, buffer) {
		const { scope } = node;
		const initPosition = buffer[position];
		node.init = initPosition === 0 ? null : convertNode(node, scope, initPosition, buffer);
		const testPosition = buffer[position + 1];
		node.test = testPosition === 0 ? null : convertNode(node, scope, testPosition, buffer);
		const updatePosition = buffer[position + 2];
		node.update = updatePosition === 0 ? null : convertNode(node, scope, updatePosition, buffer);
		node.body = convertNode(node, scope, buffer[position + 3], buffer);
	},
	function functionDeclaration(node: FunctionDeclaration, position, buffer) {
		const { scope } = node;
		const flags = buffer[position];
		node.async = (flags & 1) === 1;
		node.generator = (flags & 2) === 2;
		const annotations = (node.annotations = convertAnnotations(buffer[position + 1], buffer));
		node.annotationNoSideEffects = annotations.some(comment => comment.type === 'noSideEffects');
		const idPosition = buffer[position + 2];
		node.id =
			idPosition === 0 ? null : convertNode(node, scope.parent as ChildScope, idPosition, buffer);
		const parameters = (node.params = convertNodeList(node, scope, buffer[position + 3], buffer));
		scope.addParameterVariables(
			parameters.map(
				parameter => parameter.declare('parameter', UNKNOWN_EXPRESSION) as ParameterVariable[]
			),
			parameters[parameters.length - 1] instanceof RestElement
		);
		node.body = convertNode(node, scope.bodyScope, buffer[position + 4], buffer);
	},
	function functionExpression(node: FunctionExpression, position, buffer) {
		const { scope } = node;
		const flags = buffer[position];
		node.async = (flags & 1) === 1;
		node.generator = (flags & 2) === 2;
		const annotations = (node.annotations = convertAnnotations(buffer[position + 1], buffer));
		node.annotationNoSideEffects = annotations.some(comment => comment.type === 'noSideEffects');
		const idPosition = buffer[position + 2];
		node.id = idPosition === 0 ? null : convertNode(node, node.idScope, idPosition, buffer);
		const parameters = (node.params = convertNodeList(node, scope, buffer[position + 3], buffer));
		scope.addParameterVariables(
			parameters.map(
				parameter => parameter.declare('parameter', UNKNOWN_EXPRESSION) as ParameterVariable[]
			),
			parameters[parameters.length - 1] instanceof RestElement
		);
		node.body = convertNode(node, scope.bodyScope, buffer[position + 4], buffer);
	},
	function identifier(node: Identifier, position, buffer) {
		node.name = buffer.convertString(buffer[position]);
	},
	function ifStatement(node: IfStatement, position, buffer) {
		const { scope } = node;
		node.test = convertNode(node, scope, buffer[position], buffer);
		node.consequent = convertNode(
			node,
			(node.consequentScope = new TrackingScope(scope)),
			buffer[position + 1],
			buffer
		);
		const alternatePosition = buffer[position + 2];
		node.alternate =
			alternatePosition === 0
				? null
				: convertNode(
						node,
						(node.alternateScope = new TrackingScope(scope)),
						alternatePosition,
						buffer
					);
	},
	function importAttribute(node: ImportAttribute, position, buffer) {
		const { scope } = node;
		node.key = convertNode(node, scope, buffer[position], buffer);
		node.value = convertNode(node, scope, buffer[position + 1], buffer);
	},
	function importDeclaration(node: ImportDeclaration, position, buffer) {
		const { scope } = node;
		node.specifiers = convertNodeList(node, scope, buffer[position], buffer);
		node.source = convertNode(node, scope, buffer[position + 1], buffer);
		node.attributes = convertNodeList(node, scope, buffer[position + 2], buffer);
	},
	function importDefaultSpecifier(node: ImportDefaultSpecifier, position, buffer) {
		const { scope } = node;
		node.local = convertNode(node, scope, buffer[position], buffer);
	},
	function importExpression(node: ImportExpression, position, buffer) {
		const { scope } = node;
		node.source = convertNode(node, scope, buffer[position], buffer);
		node.sourceAstNode = convertJsonNode(buffer[position], buffer);
		const optionsPosition = buffer[position + 1];
		node.options = optionsPosition === 0 ? null : convertNode(node, scope, optionsPosition, buffer);
	},
	function importNamespaceSpecifier(node: ImportNamespaceSpecifier, position, buffer) {
		const { scope } = node;
		node.local = convertNode(node, scope, buffer[position], buffer);
	},
	function importSpecifier(node: ImportSpecifier, position, buffer) {
		const { scope } = node;
		const importedPosition = buffer[position];
		node.local = convertNode(node, scope, buffer[position + 1], buffer);
		node.imported =
			importedPosition === 0 ? node.local : convertNode(node, scope, importedPosition, buffer);
	},
	function jsxAttribute(node: JSXAttribute, position, buffer) {
		const { scope } = node;
		node.name = convertNode(node, scope, buffer[position], buffer);
		const valuePosition = buffer[position + 1];
		node.value = valuePosition === 0 ? null : convertNode(node, scope, valuePosition, buffer);
	},
	function jsxClosingElement(node: JSXClosingElement, position, buffer) {
		const { scope } = node;
		node.name = convertNode(node, scope, buffer[position], buffer);
	},
	function jsxClosingFragment() {},
	function jsxElement(node: JSXElement, position, buffer) {
		const { scope } = node;
		node.openingElement = convertNode(node, scope, buffer[position], buffer);
		node.children = convertNodeList(node, scope, buffer[position + 1], buffer);
		const closingElementPosition = buffer[position + 2];
		node.closingElement =
			closingElementPosition === 0
				? null
				: convertNode(node, scope, closingElementPosition, buffer);
	},
	function jsxEmptyExpression() {},
	function jsxExpressionContainer(node: JSXExpressionContainer, position, buffer) {
		const { scope } = node;
		node.expression = convertNode(node, scope, buffer[position], buffer);
	},
	function jsxFragment(node: JSXFragment, position, buffer) {
		const { scope } = node;
		node.openingFragment = convertNode(node, scope, buffer[position], buffer);
		node.children = convertNodeList(node, scope, buffer[position + 1], buffer);
		node.closingFragment = convertNode(node, scope, buffer[position + 2], buffer);
	},
	function jsxIdentifier(node: JSXIdentifier, position, buffer) {
		node.name = buffer.convertString(buffer[position]);
	},
	function jsxMemberExpression(node: JSXMemberExpression, position, buffer) {
		const { scope } = node;
		node.object = convertNode(node, scope, buffer[position], buffer);
		node.property = convertNode(node, scope, buffer[position + 1], buffer);
	},
	function jsxNamespacedName(node: JSXNamespacedName, position, buffer) {
		const { scope } = node;
		node.namespace = convertNode(node, scope, buffer[position], buffer);
		node.name = convertNode(node, scope, buffer[position + 1], buffer);
	},
	function jsxOpeningElement(node: JSXOpeningElement, position, buffer) {
		const { scope } = node;
		const flags = buffer[position];
		node.selfClosing = (flags & 1) === 1;
		node.name = convertNode(node, scope, buffer[position + 1], buffer);
		node.attributes = convertNodeList(node, scope, buffer[position + 2], buffer);
	},
	function jsxOpeningFragment(node: JSXOpeningFragment) {
		node.attributes = [];
		node.selfClosing = false;
	},
	function jsxSpreadAttribute(node: JSXSpreadAttribute, position, buffer) {
		const { scope } = node;
		node.argument = convertNode(node, scope, buffer[position], buffer);
	},
	function jsxSpreadChild(node: JSXSpreadChild, position, buffer) {
		const { scope } = node;
		node.expression = convertNode(node, scope, buffer[position], buffer);
	},
	function jsxText(node: JSXText, position, buffer) {
		node.value = buffer.convertString(buffer[position]);
		node.raw = buffer.convertString(buffer[position + 1]);
	},
	function labeledStatement(node: LabeledStatement, position, buffer) {
		const { scope } = node;
		node.label = convertNode(node, scope, buffer[position], buffer);
		node.body = convertNode(node, scope, buffer[position + 1], buffer);
	},
	function literalBigInt(node: Literal, position, buffer) {
		const bigint = (node.bigint = buffer.convertString(buffer[position]));
		node.raw = buffer.convertString(buffer[position + 1]);
		node.value = BigInt(bigint);
	},
	function literalBoolean(node: Literal, position, buffer) {
		const flags = buffer[position];
		const value = (node.value = (flags & 1) === 1);
		node.raw = value ? 'true' : 'false';
	},
	function literalNull(node: Literal) {
		node.value = null;
	},
	function literalNumber(node: Literal, position, buffer) {
		const rawPosition = buffer[position];
		node.raw = rawPosition === 0 ? undefined : buffer.convertString(rawPosition);
		node.value = new DataView(buffer.buffer).getFloat64((position + 1) << 2, true);
	},
	function literalRegExp(node: Literal, position, buffer) {
		const flags = buffer.convertString(buffer[position]);
		const pattern = buffer.convertString(buffer[position + 1]);
		node.raw = `/${pattern}/${flags}`;
		node.regex = { flags, pattern };
		node.value = new RegExp(pattern, flags);
	},
	function literalString(node: Literal, position, buffer) {
		node.value = buffer.convertString(buffer[position]);
		const rawPosition = buffer[position + 1];
		node.raw = rawPosition === 0 ? undefined : buffer.convertString(rawPosition);
	},
	function logicalExpression(node: LogicalExpression, position, buffer) {
		const { scope } = node;
		node.operator = FIXED_STRINGS[buffer[position]] as estree.LogicalOperator;
		node.left = convertNode(node, scope, buffer[position + 1], buffer);
		node.right = convertNode(node, scope, buffer[position + 2], buffer);
	},
	function memberExpression(node: MemberExpression, position, buffer) {
		const { scope } = node;
		const flags = buffer[position];
		node.computed = (flags & 1) === 1;
		node.optional = (flags & 2) === 2;
		node.object = convertNode(node, scope, buffer[position + 1], buffer);
		node.property = convertNode(node, scope, buffer[position + 2], buffer);
	},
	function metaProperty(node: MetaProperty, position, buffer) {
		const { scope } = node;
		node.meta = convertNode(node, scope, buffer[position], buffer);
		node.property = convertNode(node, scope, buffer[position + 1], buffer);
	},
	function methodDefinition(node: MethodDefinition, position, buffer) {
		const { scope } = node;
		const flags = buffer[position];
		node.static = (flags & 1) === 1;
		node.computed = (flags & 2) === 2;
		node.decorators = convertNodeList(node, scope, buffer[position + 1], buffer);
		node.key = convertNode(node, scope, buffer[position + 2], buffer);
		node.value = convertNode(node, scope, buffer[position + 3], buffer);
		node.kind = FIXED_STRINGS[buffer[position + 4]] as estree.MethodDefinition['kind'];
	},
	function newExpression(node: NewExpression, position, buffer) {
		const { scope } = node;
		node.annotations = convertAnnotations(buffer[position], buffer);
		node.callee = convertNode(node, scope, buffer[position + 1], buffer);
		node.arguments = convertNodeList(node, scope, buffer[position + 2], buffer);
	},
	function objectExpression(node: ObjectExpression, position, buffer) {
		const { scope } = node;
		node.properties = convertNodeList(node, scope, buffer[position], buffer);
	},
	function objectPattern(node: ObjectPattern, position, buffer) {
		const { scope } = node;
		node.properties = convertNodeList(node, scope, buffer[position], buffer);
	},
	function privateIdentifier(node: PrivateIdentifier, position, buffer) {
		node.name = buffer.convertString(buffer[position]);
	},
	function program(node: Program, position, buffer) {
		const { scope } = node;
		node.body = convertNodeList(node, scope, buffer[position], buffer);
		node.invalidAnnotations = convertAnnotations(buffer[position + 1], buffer);
	},
	function property(node: Property, position, buffer) {
		const { scope } = node;
		const flags = buffer[position];
		node.method = (flags & 1) === 1;
		node.shorthand = (flags & 2) === 2;
		node.computed = (flags & 4) === 4;
		const keyPosition = buffer[position + 1];
		node.value = convertNode(node, scope, buffer[position + 2], buffer);
		node.kind = FIXED_STRINGS[buffer[position + 3]] as estree.Property['kind'];
		node.key = keyPosition === 0 ? node.value : convertNode(node, scope, keyPosition, buffer);
	},
	function propertyDefinition(node: PropertyDefinition, position, buffer) {
		const { scope } = node;
		const flags = buffer[position];
		node.static = (flags & 1) === 1;
		node.computed = (flags & 2) === 2;
		node.decorators = convertNodeList(node, scope, buffer[position + 1], buffer);
		node.key = convertNode(node, scope, buffer[position + 2], buffer);
		const valuePosition = buffer[position + 3];
		node.value = valuePosition === 0 ? null : convertNode(node, scope, valuePosition, buffer);
	},
	function restElement(node: RestElement, position, buffer) {
		const { scope } = node;
		node.argument = convertNode(node, scope, buffer[position], buffer);
	},
	function returnStatement(node: ReturnStatement, position, buffer) {
		const { scope } = node;
		const argumentPosition = buffer[position];
		node.argument =
			argumentPosition === 0 ? null : convertNode(node, scope, argumentPosition, buffer);
	},
	function sequenceExpression(node: SequenceExpression, position, buffer) {
		const { scope } = node;
		node.expressions = convertNodeList(node, scope, buffer[position], buffer);
	},
	function spreadElement(node: SpreadElement, position, buffer) {
		const { scope } = node;
		node.argument = convertNode(node, scope, buffer[position], buffer);
	},
	function staticBlock(node: StaticBlock, position, buffer) {
		const { scope } = node;
		node.body = convertNodeList(node, scope, buffer[position], buffer);
	},
	function superElement() {},
	function switchCase(node: SwitchCase, position, buffer) {
		const { scope } = node;
		const testPosition = buffer[position];
		node.test = testPosition === 0 ? null : convertNode(node, scope, testPosition, buffer);
		node.consequent = convertNodeList(node, scope, buffer[position + 1], buffer);
	},
	function switchStatement(node: SwitchStatement, position, buffer) {
		const { scope } = node;
		node.discriminant = convertNode(node, node.parentScope, buffer[position], buffer);
		node.cases = convertNodeList(node, scope, buffer[position + 1], buffer);
	},
	function taggedTemplateExpression(node: TaggedTemplateExpression, position, buffer) {
		const { scope } = node;
		node.tag = convertNode(node, scope, buffer[position], buffer);
		node.quasi = convertNode(node, scope, buffer[position + 1], buffer);
	},
	function templateElement(node: TemplateElement, position, buffer) {
		const flags = buffer[position];
		node.tail = (flags & 1) === 1;
		const cookedPosition = buffer[position + 1];
		const cooked = cookedPosition === 0 ? undefined : buffer.convertString(cookedPosition);
		const raw = buffer.convertString(buffer[position + 2]);
		node.value = { cooked, raw };
	},
	function templateLiteral(node: TemplateLiteral, position, buffer) {
		const { scope } = node;
		node.quasis = convertNodeList(node, scope, buffer[position], buffer);
		node.expressions = convertNodeList(node, scope, buffer[position + 1], buffer);
	},
	function thisExpression() {},
	function throwStatement(node: ThrowStatement, position, buffer) {
		const { scope } = node;
		node.argument = convertNode(node, scope, buffer[position], buffer);
	},
	function tryStatement(node: TryStatement, position, buffer) {
		const { scope } = node;
		node.block = convertNode(node, scope, buffer[position], buffer);
		const handlerPosition = buffer[position + 1];
		node.handler = handlerPosition === 0 ? null : convertNode(node, scope, handlerPosition, buffer);
		const finalizerPosition = buffer[position + 2];
		node.finalizer =
			finalizerPosition === 0 ? null : convertNode(node, scope, finalizerPosition, buffer);
	},
	function unaryExpression(node: UnaryExpression, position, buffer) {
		const { scope } = node;
		node.operator = FIXED_STRINGS[buffer[position]] as estree.UnaryOperator;
		node.argument = convertNode(node, scope, buffer[position + 1], buffer);
	},
	function updateExpression(node: UpdateExpression, position, buffer) {
		const { scope } = node;
		const flags = buffer[position];
		node.prefix = (flags & 1) === 1;
		node.operator = FIXED_STRINGS[buffer[position + 1]] as estree.UpdateOperator;
		node.argument = convertNode(node, scope, buffer[position + 2], buffer);
	},
	function variableDeclaration(node: VariableDeclaration, position, buffer) {
		const { scope } = node;
		node.kind = FIXED_STRINGS[buffer[position]] as estree.VariableDeclaration['kind'];
		node.declarations = convertNodeList(node, scope, buffer[position + 1], buffer);
	},
	function variableDeclarator(node: VariableDeclarator, position, buffer) {
		const { scope } = node;
		node.id = convertNode(node, scope, buffer[position], buffer);
		const initPosition = buffer[position + 1];
		node.init = initPosition === 0 ? null : convertNode(node, scope, initPosition, buffer);
	},
	function whileStatement(node: WhileStatement, position, buffer) {
		const { scope } = node;
		node.test = convertNode(node, scope, buffer[position], buffer);
		node.body = convertNode(node, scope, buffer[position + 1], buffer);
	},
	function yieldExpression(node: YieldExpression, position, buffer) {
		const { scope } = node;
		const flags = buffer[position];
		node.delegate = (flags & 1) === 1;
		const argumentPosition = buffer[position + 1];
		node.argument =
			argumentPosition === 0 ? null : convertNode(node, scope, argumentPosition, buffer);
	}
];

function convertNode(
	parent: Node | { context: AstContext; type: string },
	parentScope: ChildScope,
	position: number,
	buffer: AstBuffer
): any {
	const nodeType = buffer[position];
	const NodeConstructor = nodeConstructors[nodeType];
	/* istanbul ignore if: This should never be executed but is a safeguard against faulty buffers */
	if (!NodeConstructor) {
		console.trace();
		throw new Error(`Unknown node type: ${nodeType}`);
	}
	const node = new NodeConstructor(parent, parentScope);
	node.type = nodeTypeStrings[nodeType];
	node.start = buffer[position + 1];
	node.end = buffer[position + 2];
	bufferParsers[nodeType](node, position + 3, buffer);
	node.initialise();
	return node;
}

function convertNodeList(
	parent: Node | { context: AstContext; type: string },
	parentScope: ChildScope,
	position: number,
	buffer: AstBuffer
): any[] {
	if (position === 0) return EMPTY_ARRAY as never[];
	const length = buffer[position++];
	const list: any[] = new Array(length);
	for (let index = 0; index < length; index++) {
		const nodePosition = buffer[position++];
		list[index] = nodePosition ? convertNode(parent, parentScope, nodePosition, buffer) : null;
	}
	return list;
}
