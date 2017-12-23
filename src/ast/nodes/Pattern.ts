import ObjectPattern from "./ObjectPattern";
import ArrayPattern from "./ArrayPattern";
import RestElement from "./RestElement";
import AssignmentPattern from "./AssignmentPattern";
import Identifier from "./Identifier";

type Pattern = ObjectPattern | ArrayPattern | RestElement | AssignmentPattern | Identifier;

export default Pattern;