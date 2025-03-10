use swc_ecma_ast::{UnaryExpr, UnaryOp};

use crate::convert_ast::converter::string_constants::{
  STRING_BANG, STRING_DELETE, STRING_MINUS, STRING_PLUS, STRING_TILDE, STRING_TYPEOF, STRING_VOID,
};
use crate::convert_ast::converter::AstConverter;
use crate::store_unary_expression;

impl AstConverter<'_> {
  pub(crate) fn store_unary_expression(&mut self, unary_expression: &UnaryExpr) {
    store_unary_expression!(
      self,
      span => &unary_expression.span,
      operator => match unary_expression.op {
        UnaryOp::Minus => &STRING_MINUS,
        UnaryOp::Plus => &STRING_PLUS,
        UnaryOp::Bang => &STRING_BANG,
        UnaryOp::Tilde => &STRING_TILDE,
        UnaryOp::TypeOf => &STRING_TYPEOF,
        UnaryOp::Void => &STRING_VOID,
        UnaryOp::Delete => &STRING_DELETE,
      },
      argument => [unary_expression.arg, convert_expression]
    );
  }
}
