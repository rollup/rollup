use swc_ecma_ast::IfStmt;

use crate::convert_ast::converter::AstConverter;
use crate::store_if_statement;

impl<'a> AstConverter<'a> {
  pub fn store_if_statement(&mut self, if_statement: &IfStmt) {
    store_if_statement!(
      self,
      span => &if_statement.span,
      test => [if_statement.test, convert_expression],
      consequent => [if_statement.cons, convert_statement],
      alternate => [if_statement.alt, convert_statement]
    );
  }
}
