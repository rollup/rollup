use swc_ecma_ast::JSXElement;

use crate::convert_ast::converter::ast_constants::{
    JSX_ELEMENT_CHILDREN_OFFSET, JSX_ELEMENT_CLOSING_ELEMENT_OFFSET,
    JSX_ELEMENT_OPENING_ELEMENT_OFFSET, JSX_ELEMENT_RESERVED_BYTES, TYPE_JSX_ELEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_element(&mut self, jsx_element: &JSXElement) {
    let end_position = self.add_type_and_start(
      &TYPE_JSX_ELEMENT,
      &jsx_element.span,
      JSX_ELEMENT_RESERVED_BYTES,
      false,
    );
    // openingElement
    self.update_reference_position(end_position + JSX_ELEMENT_OPENING_ELEMENT_OFFSET);
    self.store_jsx_opening_element(&jsx_element.opening);
    // children
    self.convert_item_list(
      &jsx_element.children,
      end_position + JSX_ELEMENT_CHILDREN_OFFSET,
      |ast_converter, jsx_element_child| {
        ast_converter.convert_jsx_element_child(jsx_element_child);
        true
      },
    );
    // closingElement
    if let Some(closing) = jsx_element.closing.as_ref() {
      self.update_reference_position(end_position + JSX_ELEMENT_CLOSING_ELEMENT_OFFSET);
      self.store_jsx_closing_element(closing);
    }
    // end
    self.add_end(end_position, &jsx_element.span);
  }
}
