use swc_common::Span;
use swc_ecma_ast::{ExprOrSpread, Import};

use crate::convert_ast::converter::ast_constants::{
  IMPORT_EXPRESSION_OPTIONS_OFFSET, IMPORT_EXPRESSION_PHASE_OFFSET,
  IMPORT_EXPRESSION_RESERVED_BYTES, IMPORT_EXPRESSION_SOURCE_OFFSET, TYPE_IMPORT_EXPRESSION,
};
use crate::convert_ast::converter::string_constants::{
  STRING_DEFER, STRING_INSTANCE, STRING_SOURCE,
};
use crate::convert_ast::converter::AstConverter;

impl AstConverter<'_> {
  pub(crate) fn store_import_expression(
    &mut self,
    span: &Span,
    arguments: &[ExprOrSpread],
    import: &Import,
  ) {
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
    // phase
    let phase_position = end_position + IMPORT_EXPRESSION_PHASE_OFFSET;
    match &import.phase {
      swc_ecma_ast::ImportPhase::Source => {
        self.buffer[phase_position..phase_position + 4].copy_from_slice(&STRING_SOURCE);
      }
      swc_ecma_ast::ImportPhase::Defer => {
        self.buffer[phase_position..phase_position + 4].copy_from_slice(&STRING_DEFER);
      }
      swc_ecma_ast::ImportPhase::Evaluation => {
        // Normal imports use 'instance' phase
        self.buffer[phase_position..phase_position + 4].copy_from_slice(&STRING_INSTANCE);
      }
    }
    // end
    self.add_end(end_position, span);
  }
}
