use swc_ecma_ast::SeqExpr;

use crate::convert_ast::converter::AstConverter;
use crate::store_sequence_expression;

impl<'a> AstConverter<'a> {
  pub fn store_sequence_expression(&mut self, sequence_expression: &SeqExpr) {
    store_sequence_expression!(
      self,
      span => &sequence_expression.span,
      expressions => [sequence_expression.exprs, convert_expression]
    );
  }
}
