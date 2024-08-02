use swc_ecma_ast::CondExpr;

use crate::convert_ast::converter::AstConverter;
use crate::store_conditional_expression;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_conditional_expression(&mut self, conditional_expression: &CondExpr) {
    store_conditional_expression!(
      self,
      span => conditional_expression.span,
      test => [conditional_expression.test, convert_expression],
      consequent => [conditional_expression.cons, convert_expression],
      alternate => [conditional_expression.alt, convert_expression]
    );
  }
}
