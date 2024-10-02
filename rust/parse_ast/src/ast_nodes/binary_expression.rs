use swc_ecma_ast::{BinExpr, BinaryOp};

use crate::convert_ast::converter::ast_constants::{
  BINARY_EXPRESSION_LEFT_OFFSET, BINARY_EXPRESSION_OPERATOR_OFFSET,
  BINARY_EXPRESSION_RESERVED_BYTES, BINARY_EXPRESSION_RIGHT_OFFSET, TYPE_BINARY_EXPRESSION,
  TYPE_LOGICAL_EXPRESSION,
};
use crate::convert_ast::converter::string_constants::{
  STRING_ADD, STRING_BITAND, STRING_BITOR, STRING_BITXOR, STRING_DIV, STRING_EQEQ, STRING_EQEQEQ,
  STRING_EXP, STRING_GT, STRING_GTEQ, STRING_IN, STRING_INSTANCEOF, STRING_LOGICALAND,
  STRING_LOGICALOR, STRING_LSHIFT, STRING_LT, STRING_LTEQ, STRING_MOD, STRING_MUL, STRING_NOTEQ,
  STRING_NOTEQEQ, STRING_NULLISHCOALESCING, STRING_RSHIFT, STRING_SUB, STRING_ZEROFILLRSHIFT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_binary_expression(&mut self, binary_expression: &BinExpr) {
    let end_position = self.add_type_and_start(
      match binary_expression.op {
        BinaryOp::LogicalOr | BinaryOp::LogicalAnd | BinaryOp::NullishCoalescing => {
          &TYPE_LOGICAL_EXPRESSION
        }
        _ => &TYPE_BINARY_EXPRESSION,
      },
      &binary_expression.span,
      BINARY_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // left
    self.update_reference_position(end_position + BINARY_EXPRESSION_LEFT_OFFSET);
    self.convert_expression(&binary_expression.left);
    // operator
    let operator_position = end_position + BINARY_EXPRESSION_OPERATOR_OFFSET;
    self.buffer[operator_position..operator_position + 4].copy_from_slice(
      match binary_expression.op {
        BinaryOp::EqEq => &STRING_EQEQ,
        BinaryOp::NotEq => &STRING_NOTEQ,
        BinaryOp::EqEqEq => &STRING_EQEQEQ,
        BinaryOp::NotEqEq => &STRING_NOTEQEQ,
        BinaryOp::Lt => &STRING_LT,
        BinaryOp::LtEq => &STRING_LTEQ,
        BinaryOp::Gt => &STRING_GT,
        BinaryOp::GtEq => &STRING_GTEQ,
        BinaryOp::LShift => &STRING_LSHIFT,
        BinaryOp::RShift => &STRING_RSHIFT,
        BinaryOp::ZeroFillRShift => &STRING_ZEROFILLRSHIFT,
        BinaryOp::Add => &STRING_ADD,
        BinaryOp::Sub => &STRING_SUB,
        BinaryOp::Mul => &STRING_MUL,
        BinaryOp::Div => &STRING_DIV,
        BinaryOp::Mod => &STRING_MOD,
        BinaryOp::BitOr => &STRING_BITOR,
        BinaryOp::BitXor => &STRING_BITXOR,
        BinaryOp::BitAnd => &STRING_BITAND,
        BinaryOp::LogicalOr => &STRING_LOGICALOR,
        BinaryOp::LogicalAnd => &STRING_LOGICALAND,
        BinaryOp::In => &STRING_IN,
        BinaryOp::InstanceOf => &STRING_INSTANCEOF,
        BinaryOp::Exp => &STRING_EXP,
        BinaryOp::NullishCoalescing => &STRING_NULLISHCOALESCING,
      },
    );
    // right
    self.update_reference_position(end_position + BINARY_EXPRESSION_RIGHT_OFFSET);
    self.convert_expression(&binary_expression.right);
    // end
    self.add_end(end_position, &binary_expression.span);
  }
}
