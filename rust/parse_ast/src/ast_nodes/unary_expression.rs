use swc_ecma_ast::{UnaryExpr, UnaryOp};

use crate::convert_ast::converter::ast_constants::{
  TYPE_UNARY_EXPRESSION, UNARY_EXPRESSION_ARGUMENT_OFFSET, UNARY_EXPRESSION_OPERATOR_OFFSET,
  UNARY_EXPRESSION_RESERVED_BYTES,
};
use crate::convert_ast::converter::string_constants::{
  STRING_BANG, STRING_DELETE, STRING_MINUS, STRING_PLUS, STRING_TILDE, STRING_TYPEOF, STRING_VOID,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_unary_expression(&mut self, unary_expression: &UnaryExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_UNARY_EXPRESSION,
      &unary_expression.span,
      UNARY_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // argument
    self.update_reference_position(end_position + UNARY_EXPRESSION_ARGUMENT_OFFSET);
    self.convert_expression(&unary_expression.arg);
    // operator
    let operator_position = end_position + UNARY_EXPRESSION_OPERATOR_OFFSET;
    self.buffer[operator_position..operator_position + 4].copy_from_slice(
      match unary_expression.op {
        UnaryOp::Minus => &STRING_MINUS,
        UnaryOp::Plus => &STRING_PLUS,
        UnaryOp::Bang => &STRING_BANG,
        UnaryOp::Tilde => &STRING_TILDE,
        UnaryOp::TypeOf => &STRING_TYPEOF,
        UnaryOp::Void => &STRING_VOID,
        UnaryOp::Delete => &STRING_DELETE,
      },
    );
    // end
    self.add_end(end_position, &unary_expression.span);
  }
}
