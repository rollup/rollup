use swc_ecma_ast::JSXAttr;

use crate::convert_ast::converter::ast_constants::{
  JSX_ATTRIBUTE_NAME_OFFSET, JSX_ATTRIBUTE_RESERVED_BYTES, JSX_ATTRIBUTE_VALUE_OFFSET,
  TYPE_JSX_ATTRIBUTE,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_attribute(&mut self, jsx_attribute: &JSXAttr) {
    let end_position = self.add_type_and_start(
      &TYPE_JSX_ATTRIBUTE,
      &jsx_attribute.span,
      JSX_ATTRIBUTE_RESERVED_BYTES,
      false,
    );
    // name
    self.update_reference_position(end_position + JSX_ATTRIBUTE_NAME_OFFSET);
    self.convert_jsx_attribute_name(&jsx_attribute.name);
    // value
    if let Some(jsx_attribute_value) = jsx_attribute.value.as_ref() {
      self.update_reference_position(end_position + JSX_ATTRIBUTE_VALUE_OFFSET);
      self.convert_jsx_attribute_value(jsx_attribute_value);
    };
    // end
    self.add_end(end_position, &jsx_attribute.span);
  }
}
