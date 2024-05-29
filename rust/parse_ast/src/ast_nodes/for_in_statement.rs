use swc_ecma_ast::ForInStmt;

use crate::convert_ast::converter::AstConverter;
use crate::store_for_in_statement;

impl<'a> AstConverter<'a> {
  pub fn store_for_in_statement(&mut self, for_in_statement: &ForInStmt) {
    store_for_in_statement!(
      self,
      span => &for_in_statement.span,
      left => [for_in_statement.left, convert_for_head],
      right => [for_in_statement.right, convert_expression],
      body => [for_in_statement.body, convert_statement]
    );
  }
}
