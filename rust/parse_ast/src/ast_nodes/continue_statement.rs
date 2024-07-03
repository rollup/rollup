use swc_ecma_ast::ContinueStmt;

use crate::convert_ast::converter::AstConverter;
use crate::store_continue_statement;

impl<'a> AstConverter<'a> {
  pub fn store_continue_statement(&mut self, continue_statement: &ContinueStmt) {
    store_continue_statement!(
      self,
      span => continue_statement.span,
      label => [continue_statement.label, convert_identifier]
    );
  }
}
