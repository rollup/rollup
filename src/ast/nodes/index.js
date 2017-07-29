import ArrayExpression from './ArrayExpression.js';
import ArrowFunctionExpression from './ArrowFunctionExpression.js';
import AssignmentExpression from './AssignmentExpression.js';
import BinaryExpression from './BinaryExpression.js';
import BlockStatement from './BlockStatement.js';
import CallExpression from './CallExpression.js';
import CatchClause from './CatchClause.js';
import ClassDeclaration from './ClassDeclaration.js';
import ClassExpression from './ClassExpression.js';
import ConditionalExpression from './ConditionalExpression.js';
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
import Literal from './Literal.js';
import LogicalExpression from './LogicalExpression.js';
import MemberExpression from './MemberExpression.js';
import NewExpression from './NewExpression.js';
import ObjectExpression from './ObjectExpression.js';
import ReturnStatement from './ReturnStatement.js';
import Statement from './shared/Statement.js';
import TaggedTemplateExpression from './TaggedTemplateExpression.js';
import TemplateLiteral from './TemplateLiteral.js';
import ThisExpression from './ThisExpression.js';
import ThrowStatement from './ThrowStatement.js';
import UnaryExpression from './UnaryExpression.js';
import UpdateExpression from './UpdateExpression.js';
import VariableDeclarator from './VariableDeclarator.js';
import VariableDeclaration from './VariableDeclaration.js';

export default {
	ArrayExpression,
	ArrowFunctionExpression,
	AssignmentExpression,
	BinaryExpression,
	BlockStatement,
	CallExpression,
	CatchClause,
	ClassDeclaration,
	ClassExpression,
	ConditionalExpression,
	DoWhileStatement: Statement,
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
	Literal,
	LogicalExpression,
	MemberExpression,
	NewExpression,
	ObjectExpression,
	ReturnStatement,
	SwitchStatement: Statement,
	TaggedTemplateExpression,
	TemplateLiteral,
	ThisExpression,
	ThrowStatement,
	TryStatement: Statement,
	UnaryExpression,
	UpdateExpression,
	VariableDeclarator,
	VariableDeclaration,
	WhileStatement: Statement
};
