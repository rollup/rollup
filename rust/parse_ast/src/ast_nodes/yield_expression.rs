use swc_ecma_ast::YieldExpr;

use crate::{store_yield_expression, store_yield_expression_flags};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_yield_expression(&mut self, yield_expression: &YieldExpr) {
    store_yield_expression!(
      self,
      span => yield_expression.span,
      delegate => yield_expression.delegate,
      argument => [yield_expression.arg, convert_expression]
    );
  }
}
