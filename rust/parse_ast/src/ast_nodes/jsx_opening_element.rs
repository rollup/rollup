use swc_common::Spanned;
use swc_ecma_ast::JSXOpeningElement;

use crate::convert_ast::converter::ast_constants::{
  JSX_OPENING_ELEMENT_ATTRIBUTES_OFFSET, JSX_OPENING_ELEMENT_NAME_OFFSET,
  JSX_OPENING_ELEMENT_RESERVED_BYTES, TYPE_JSX_OPENING_ELEMENT,
};
use crate::convert_ast::converter::AstConverter;
use crate::store_jsx_opening_element_flags;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_opening_element(&mut self, jsx_opening_element: &JSXOpeningElement) {
    let end_position = self.add_type_and_start(
      &TYPE_JSX_OPENING_ELEMENT,
      &jsx_opening_element.span,
      JSX_OPENING_ELEMENT_RESERVED_BYTES,
      false,
    );
    // flags
    store_jsx_opening_element_flags!(
      self,
      end_position,
      selfClosing => jsx_opening_element.self_closing
    );
    // name
    self.update_reference_position(end_position + JSX_OPENING_ELEMENT_NAME_OFFSET);
    self.convert_jsx_element_name(&jsx_opening_element.name);
    // attributes
    let mut previous_element_end = jsx_opening_element.name.span().hi.0;
    self.convert_item_list_with_state(
      &jsx_opening_element.attrs,
      &mut previous_element_end,
      end_position + JSX_OPENING_ELEMENT_ATTRIBUTES_OFFSET,
      |ast_converter, jsx_attribute, previous_end| {
        ast_converter.convert_jsx_attribute_or_spread(jsx_attribute, *previous_end);
        *previous_end = jsx_attribute.span().hi.0;
        true
      },
    );
    // end
    self.add_end(end_position, &jsx_opening_element.span);
  }
}
