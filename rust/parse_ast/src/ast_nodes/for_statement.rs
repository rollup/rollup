use swc_ecma_ast::ForStmt;

use crate::convert_ast::converter::AstConverter;
use crate::store_for_statement;

impl AstConverter<'_> {
  pub(crate) fn store_for_statement(&mut self, for_statement: &ForStmt) {
    store_for_statement!(
      self,
      span => &for_statement.span,
      init => [for_statement.init, convert_variable_declaration_or_expression],
      test => [for_statement.test, convert_expression],
      update => [for_statement.update, convert_expression],
      body => [for_statement.body, convert_statement]
    );
  }
}
