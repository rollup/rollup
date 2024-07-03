use swc_ecma_ast::DoWhileStmt;

use crate::convert_ast::converter::AstConverter;
use crate::store_do_while_statement;

impl<'a> AstConverter<'a> {
  pub fn store_do_while_statement(&mut self, do_while_statement: &DoWhileStmt) {
    store_do_while_statement!(
      self,
      span => do_while_statement.span,
      body => [do_while_statement.body, convert_statement],
      test => [do_while_statement.test, convert_expression]
    );
  }
}
