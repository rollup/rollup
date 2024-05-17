use swc_ecma_ast::{AssignExpr, AssignOp};

use crate::convert_ast::converter::ast_constants::{
  ASSIGNMENT_EXPRESSION_LEFT_OFFSET, ASSIGNMENT_EXPRESSION_OPERATOR_OFFSET,
  ASSIGNMENT_EXPRESSION_RESERVED_BYTES, ASSIGNMENT_EXPRESSION_RIGHT_OFFSET,
  TYPE_ASSIGNMENT_EXPRESSION,
};
use crate::convert_ast::converter::string_constants::{
  STRING_ADDASSIGN, STRING_ANDASSIGN, STRING_ASSIGN, STRING_BITANDASSIGN, STRING_BITORASSIGN,
  STRING_BITXORASSIGN, STRING_DIVASSIGN, STRING_EXPASSIGN, STRING_LSHIFTASSIGN, STRING_MODASSIGN,
  STRING_MULASSIGN, STRING_NULLISHASSIGN, STRING_ORASSIGN, STRING_RSHIFTASSIGN, STRING_SUBASSIGN,
  STRING_ZEROFILLRSHIFTASSIGN,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_assignment_expression(&mut self, assignment_expression: &AssignExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_ASSIGNMENT_EXPRESSION,
      &assignment_expression.span,
      ASSIGNMENT_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // left
    self.update_reference_position(end_position + ASSIGNMENT_EXPRESSION_LEFT_OFFSET);
    self.convert_pattern_or_expression(&assignment_expression.left);
    // operator
    let operator_position = end_position + ASSIGNMENT_EXPRESSION_OPERATOR_OFFSET;
    self.buffer[operator_position..operator_position + 4].copy_from_slice(
      match assignment_expression.op {
        AssignOp::Assign => &STRING_ASSIGN,
        AssignOp::AddAssign => &STRING_ADDASSIGN,
        AssignOp::SubAssign => &STRING_SUBASSIGN,
        AssignOp::MulAssign => &STRING_MULASSIGN,
        AssignOp::DivAssign => &STRING_DIVASSIGN,
        AssignOp::ModAssign => &STRING_MODASSIGN,
        AssignOp::LShiftAssign => &STRING_LSHIFTASSIGN,
        AssignOp::RShiftAssign => &STRING_RSHIFTASSIGN,
        AssignOp::ZeroFillRShiftAssign => &STRING_ZEROFILLRSHIFTASSIGN,
        AssignOp::BitOrAssign => &STRING_BITORASSIGN,
        AssignOp::BitXorAssign => &STRING_BITXORASSIGN,
        AssignOp::BitAndAssign => &STRING_BITANDASSIGN,
        AssignOp::ExpAssign => &STRING_EXPASSIGN,
        AssignOp::AndAssign => &STRING_ANDASSIGN,
        AssignOp::OrAssign => &STRING_ORASSIGN,
        AssignOp::NullishAssign => &STRING_NULLISHASSIGN,
      },
    );
    // right
    self.update_reference_position(end_position + ASSIGNMENT_EXPRESSION_RIGHT_OFFSET);
    self.convert_expression(&assignment_expression.right);
    // end
    self.add_end(end_position, &assignment_expression.span);
  }
}
