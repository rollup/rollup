use swc_ecma_ast::BreakStmt;

use crate::convert_ast::converter::AstConverter;
use crate::store_break_statement;

impl<'a> AstConverter<'a> {
  pub fn store_break_statement(&mut self, break_statement: &BreakStmt) {
    store_break_statement!(
      self,
      span => break_statement.span,
      label => [break_statement.label, convert_identifier]
    );
  }
}
