use swc_ecma_ast::ThisExpr;

use crate::convert_ast::converter::AstConverter;
use crate::store_this_expression;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_this_expression(&mut self, this_expression: &ThisExpr) {
    store_this_expression!(self, span => this_expression.span);
  }
}
