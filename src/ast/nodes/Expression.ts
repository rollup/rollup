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

interface Super extends Node {
  type: 'Super';
};

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
  YieldExpression | Super;

export default Expression;