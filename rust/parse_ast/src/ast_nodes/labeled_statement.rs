use swc_ecma_ast::LabeledStmt;

use crate::convert_ast::converter::AstConverter;
use crate::store_labeled_statement;

impl<'a> AstConverter<'a> {
  pub fn store_labeled_statement(&mut self, labeled_statement: &LabeledStmt) {
    store_labeled_statement!(
      self,
      span => &labeled_statement.span,
      label => [labeled_statement.label, convert_identifier],
      body => [labeled_statement.body, convert_statement]
    );
  }
}
