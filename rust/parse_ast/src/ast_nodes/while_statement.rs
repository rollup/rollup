use swc_ecma_ast::WhileStmt;

use crate::convert_ast::converter::AstConverter;
use crate::store_while_statement;

impl<'a> AstConverter<'a> {
  pub fn store_while_statement(&mut self, while_statement: &WhileStmt) {
    store_while_statement!(
      self,
      span => &while_statement.span,
      test => [while_statement.test, convert_expression],
      body => [while_statement.body, convert_statement]
    );
  }
}
