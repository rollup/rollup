use swc_ecma_ast::SwitchStmt;

use crate::convert_ast::converter::AstConverter;
use crate::store_switch_statement;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_switch_statement(&mut self, switch_statement: &SwitchStmt) {
    store_switch_statement!(
      self,
      span => &switch_statement.span,
      discriminant => [switch_statement.discriminant, convert_expression],
      cases => [switch_statement.cases, store_switch_case]
    );
  }
}
