use swc_common::Span;

use crate::convert_ast::converter::ast_constants::{
    JSX_IDENTIFIER_NAME_OFFSET, JSX_IDENTIFIER_RESERVED_BYTES, TYPE_JSX_IDENTIFIER,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_identifier(&mut self, span: &Span, name: &str) {
    let end_position = self.add_type_and_start(
      &TYPE_JSX_IDENTIFIER,
      span,
      JSX_IDENTIFIER_RESERVED_BYTES,
      false,
    );
    // name
    self.convert_string(name, end_position + JSX_IDENTIFIER_NAME_OFFSET);
    // end
    self.add_end(end_position, span);
  }
}
