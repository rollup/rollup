use swc_ecma_ast::LabeledStmt;

use crate::convert_ast::converter::ast_constants::{
  LABELED_STATEMENT_BODY_OFFSET, LABELED_STATEMENT_LABEL_OFFSET, LABELED_STATEMENT_RESERVED_BYTES,
  TYPE_LABELED_STATEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_labeled_statement(&mut self, labeled_statement: &LabeledStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_LABELED_STATEMENT,
      &labeled_statement.span,
      LABELED_STATEMENT_RESERVED_BYTES,
      false,
    );
    // label
    self.update_reference_position(end_position + LABELED_STATEMENT_LABEL_OFFSET);
    self.convert_identifier(&labeled_statement.label);
    // body
    self.update_reference_position(end_position + LABELED_STATEMENT_BODY_OFFSET);
    self.convert_statement(&labeled_statement.body);
    // end
    self.add_end(end_position, &labeled_statement.span);
  }
}
