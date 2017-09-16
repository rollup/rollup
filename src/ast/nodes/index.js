import ArrayPattern from './ArrayPattern.js';
import ArrowFunctionExpression from './ArrowFunctionExpression.js';
import AssignmentExpression from './AssignmentExpression.js';
import AssignmentPattern from './AssignmentPattern.js';
import AwaitExpression from './AwaitExpression.js';
import BinaryExpression from './BinaryExpression.js';
import BlockStatement from './BlockStatement.js';
import BreakStatement from './BreakStatement';
import CallExpression from './CallExpression.js';
import CatchClause from './CatchClause.js';
import ClassBody from './ClassBody.js';
import ClassDeclaration from './ClassDeclaration.js';
import ClassExpression from './ClassExpression.js';
import ConditionalExpression from './ConditionalExpression.js';
import DoWhileStatement from './DoWhileStatement';
import EmptyStatement from './EmptyStatement.js';
import ExportAllDeclaration from './ExportAllDeclaration.js';
import ExportDefaultDeclaration from './ExportDefaultDeclaration.js';
import ExportNamedDeclaration from './ExportNamedDeclaration.js';
import ExpressionStatement from './ExpressionStatement.js';
import ForStatement from './ForStatement.js';
import ForInStatement from './ForInStatement.js';
import ForOfStatement from './ForOfStatement.js';
import FunctionDeclaration from './FunctionDeclaration.js';
import FunctionExpression from './FunctionExpression.js';
import Identifier from './Identifier.js';
import IfStatement from './IfStatement.js';
import ImportDeclaration from './ImportDeclaration.js';
import LabeledStatement from './LabeledStatement.js';
import Literal from './Literal.js';
import LogicalExpression from './LogicalExpression.js';
import MemberExpression from './MemberExpression.js';
import MethodDefinition from './MethodDefinition';
import NewExpression from './NewExpression.js';
import ObjectExpression from './ObjectExpression.js';
import ObjectPattern from './ObjectPattern.js';
import Property from './Property.js';
import RestElement from './RestElement.js';
import ReturnStatement from './ReturnStatement.js';
import Statement from './shared/Statement.js';
import SwitchCase from './SwitchCase.js';
import SwitchStatement from './SwitchStatement.js';
import TaggedTemplateExpression from './TaggedTemplateExpression.js';
import TemplateElement from './TemplateElement.js';
import TemplateLiteral from './TemplateLiteral.js';
import ThisExpression from './ThisExpression.js';
import ThrowStatement from './ThrowStatement.js';
import UnaryExpression from './UnaryExpression.js';
import UpdateExpression from './UpdateExpression.js';
import VariableDeclarator from './VariableDeclarator.js';
import VariableDeclaration from './VariableDeclaration.js';
import WhileStatement from './WhileStatement.js';
import YieldExpression from './YieldExpression.js';
import Node from '../Node';

export default {
	ArrayExpression: Node,
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
