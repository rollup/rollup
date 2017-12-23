import ThisExpression from "./ThisExpression";
import ArrayExpression from "./ArrayExpression";
import ObjectExpression from "./ObjectExpression";
import FunctionExpression from "./FunctionExpression";
import UnaryExpression from "./UnaryExpression";
import UpdateExpression from "./UpdateExpression";
import BinaryExpression from "./BinaryExpression";
import AssignmentExpression from "./AssignmentExpression";
import LogicalExpression from "./LogicalExpression";
import MemberExpression from "./MemberExpression";
import ConditionalExpression from "./ConditionalExpression";
import CallExpression from "./CallExpression";
import NewExpression from "./NewExpression";
import SequenceExpression from "./SequenceExpression";
import ArrowFunctionExpression from "./ArrowFunctionExpression";
import YieldExpression from "./YieldExpression";
import Identifier from "./Identifier";
import Literal from "./Literal";
import AwaitExpression from "./AwaitExpression";
import TemplateLiteral from "./TemplateLiteral";
import TaggedTemplateExpression from "./TaggedTemplateExpression";
import ClassExpression from "./ClassExpression";

type Expression = ThisExpression |
  ArrayExpression |
  ObjectExpression |
  FunctionExpression |
  UnaryExpression |
  UpdateExpression |
  BinaryExpression |
  AssignmentExpression |
  LogicalExpression |
  MemberExpression |
  ConditionalExpression |
  CallExpression |
  NewExpression |
  SequenceExpression |
  ArrowFunctionExpression |
  YieldExpression |
  TemplateLiteral |
  TaggedTemplateExpression |
  ClassExpression |
  // MetaProperty |
  // Super |
  Identifier |
  Literal |
  AwaitExpression;

export default Expression;
