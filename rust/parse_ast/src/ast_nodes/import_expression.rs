use swc_common::Span;
use swc_ecma_ast::ExprOrSpread;

use crate::convert_ast::converter::ast_constants::{
  IMPORT_EXPRESSION_OPTIONS_OFFSET, IMPORT_EXPRESSION_RESERVED_BYTES,
  IMPORT_EXPRESSION_SOURCE_OFFSET, TYPE_IMPORT_EXPRESSION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_import_expression(&mut self, span: &Span, arguments: &[ExprOrSpread]) {
    let end_position = self.add_type_and_start(
      &TYPE_IMPORT_EXPRESSION,
      span,
      IMPORT_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // source
    self.update_reference_position(end_position + IMPORT_EXPRESSION_SOURCE_OFFSET);
    self.convert_expression(&arguments.first().unwrap().expr);
    // options
    if let Some(argument) = arguments.get(1) {
      self.update_reference_position(end_position + IMPORT_EXPRESSION_OPTIONS_OFFSET);
      self.convert_expression_or_spread(argument);
    }
    // end
    self.add_end(end_position, span);
  }
}
