use swc_ecma_ast::AwaitExpr;

use crate::convert_ast::converter::AstConverter;
use crate::store_await_expression;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_await_expression(&mut self, await_expression: &AwaitExpr) {
    store_await_expression!(
      self,
      span => await_expression.span,
      argument => [await_expression.arg, convert_expression]
    );
  }
}
