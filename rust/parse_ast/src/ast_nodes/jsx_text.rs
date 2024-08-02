use swc_ecma_ast::JSXText;

use crate::convert_ast::converter::ast_constants::{
  JSX_TEXT_RAW_OFFSET, JSX_TEXT_RESERVED_BYTES, JSX_TEXT_VALUE_OFFSET, TYPE_JSX_TEXT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_text(&mut self, jsx_text: &JSXText) {
    let end_position = self.add_type_and_start(
      &TYPE_JSX_TEXT,
      &jsx_text.span,
      JSX_TEXT_RESERVED_BYTES,
      false,
    );
    // value
    self.convert_string(&jsx_text.value, end_position + JSX_TEXT_VALUE_OFFSET);
    // raw
    self.convert_string(&jsx_text.raw, end_position + JSX_TEXT_RAW_OFFSET);
    // end
    self.add_end(end_position, &jsx_text.span);
  }
}
