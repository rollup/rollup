import ArrayExpression from './ArrayExpression';
import ArrayPattern from './ArrayPattern';
import ArrowFunctionExpression from './ArrowFunctionExpression';
import AssignmentExpression from './AssignmentExpression';
import AssignmentPattern from './AssignmentPattern';
import AwaitExpression from './AwaitExpression';
import BinaryExpression from './BinaryExpression';
import BlockStatement from './BlockStatement';
import BreakStatement from './BreakStatement';
import CallExpression from './CallExpression';
import CatchClause from './CatchClause';
import ClassBody from './ClassBody';
import ClassDeclaration from './ClassDeclaration';
import ClassExpression from './ClassExpression';
import ConditionalExpression from './ConditionalExpression';
import DoWhileStatement from './DoWhileStatement';
import EmptyStatement from './EmptyStatement';
import ExportAllDeclaration from './ExportAllDeclaration';
import ExportDefaultDeclaration from './ExportDefaultDeclaration';
import ExportNamedDeclaration from './ExportNamedDeclaration';
import ExportSpecifier from './ExportSpecifier';
import ExpressionStatement from './ExpressionStatement';
import ForStatement from './ForStatement';
import ForInStatement from './ForInStatement';
import ForOfStatement from './ForOfStatement';
import FunctionDeclaration from './FunctionDeclaration';
import FunctionExpression from './FunctionExpression';
import Identifier from './Identifier';
import IfStatement from './IfStatement';
import ImportDeclaration from './ImportDeclaration';
import LabeledStatement from './LabeledStatement';
import Literal from './Literal';
import LogicalExpression from './LogicalExpression';
import MemberExpression from './MemberExpression';
import MethodDefinition from './MethodDefinition';
import NewExpression from './NewExpression';
import ObjectExpression from './ObjectExpression';
import ObjectPattern from './ObjectPattern';
import Property from './Property';
import RestElement from './RestElement';
import ReturnStatement from './ReturnStatement';
import Statement from './shared/Statement';
import SequenceExpression from './SequenceExpression';
import SwitchCase from './SwitchCase';
import SwitchStatement from './SwitchStatement';
import TaggedTemplateExpression from './TaggedTemplateExpression';
import TemplateElement from './TemplateElement';
import TemplateLiteral from './TemplateLiteral';
import ThisExpression from './ThisExpression';
import ThrowStatement from './ThrowStatement';
import UnaryExpression from './UnaryExpression';
import UpdateExpression from './UpdateExpression';
import VariableDeclarator from './VariableDeclarator';
import VariableDeclaration from './VariableDeclaration';
import WhileStatement from './WhileStatement';
import YieldExpression from './YieldExpression';

import Node from '../Node';

const nodes: {
	[name: string]: typeof Node
} = {
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
	ClassBody,
	ClassDeclaration,
	ClassExpression,
	ConditionalExpression,
	DoWhileStatement,
	EmptyStatement,
	ExportAllDeclaration,
	ExportDefaultDeclaration,
	ExportNamedDeclaration,
	ExportSpecifier,
	ExpressionStatement,
	ForStatement,
	ForInStatement,
	ForOfStatement,
	FunctionDeclaration,
	FunctionExpression,
	Identifier,
	IfStatement,
	ImportDeclaration,
	LabeledStatement,
	Literal,
	LogicalExpression,
	MemberExpression,
	MethodDefinition,
	NewExpression,
	ObjectExpression,
	ObjectPattern,
	Property,
	RestElement,
	ReturnStatement,
	SequenceExpression,
	SwitchCase,
	SwitchStatement,
	TaggedTemplateExpression,
	TemplateElement,
	TemplateLiteral,
	ThisExpression,
	ThrowStatement,
	TryStatement: Statement,
	UnaryExpression,
	UpdateExpression,
	VariableDeclarator,
	VariableDeclaration,
	WhileStatement,
	YieldExpression
};

export default nodes;
