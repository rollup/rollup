use swc_ecma_ast::{AssignExpr, AssignOp};

use crate::convert_ast::converter::string_constants::{
  STRING_ADDASSIGN, STRING_ANDASSIGN, STRING_ASSIGN, STRING_BITANDASSIGN, STRING_BITORASSIGN,
  STRING_BITXORASSIGN, STRING_DIVASSIGN, STRING_EXPASSIGN, STRING_LSHIFTASSIGN, STRING_MODASSIGN,
  STRING_MULASSIGN, STRING_NULLISHASSIGN, STRING_ORASSIGN, STRING_RSHIFTASSIGN, STRING_SUBASSIGN,
  STRING_ZEROFILLRSHIFTASSIGN,
};
use crate::convert_ast::converter::AstConverter;
use crate::store_assignment_expression;

impl AstConverter<'_> {
  pub(crate) fn store_assignment_expression(&mut self, assignment_expression: &AssignExpr) {
    store_assignment_expression!(
      self,
      span => assignment_expression.span,
      operator => match assignment_expression.op {
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
      left => [assignment_expression.left, convert_pattern_or_expression],
      right => [assignment_expression.right, convert_expression]
    );
  }
}
