use swc_ecma_ast::JSXClosingElement;

use crate::convert_ast::converter::ast_constants::{
    JSX_CLOSING_ELEMENT_NAME_OFFSET, JSX_CLOSING_ELEMENT_RESERVED_BYTES, TYPE_JSX_CLOSING_ELEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_closing_element(&mut self, jsx_closing_element: &JSXClosingElement) {
    let end_position = self.add_type_and_start(
      &TYPE_JSX_CLOSING_ELEMENT,
      &jsx_closing_element.span,
      JSX_CLOSING_ELEMENT_RESERVED_BYTES,
      false,
    );
    // name
    self.update_reference_position(end_position + JSX_CLOSING_ELEMENT_NAME_OFFSET);
    self.convert_jsx_element_name(&jsx_closing_element.name);
    // end
    self.add_end(end_position, &jsx_closing_element.span);
  }
}
