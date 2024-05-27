use swc_ecma_ast::TplElement;

use crate::convert_ast::converter::ast_constants::{
  TEMPLATE_ELEMENT_COOKED_OFFSET, TEMPLATE_ELEMENT_RAW_OFFSET, TEMPLATE_ELEMENT_RESERVED_BYTES,
  TYPE_TEMPLATE_ELEMENT,
};
use crate::convert_ast::converter::AstConverter;
use crate::store_template_element_flags;

impl<'a> AstConverter<'a> {
  pub fn store_template_element(&mut self, template_element: &TplElement) {
    let end_position = self.add_type_and_start(
      &TYPE_TEMPLATE_ELEMENT,
      &template_element.span,
      TEMPLATE_ELEMENT_RESERVED_BYTES,
      false,
    );
    // flags
    store_template_element_flags!(self, end_position, tail => template_element.tail);
    // raw
    self.convert_string(
      &template_element.raw,
      end_position + TEMPLATE_ELEMENT_RAW_OFFSET,
    );
    // cooked
    if let Some(cooked) = template_element.cooked.as_ref() {
      self.convert_string(cooked, end_position + TEMPLATE_ELEMENT_COOKED_OFFSET);
    }
    // end
    self.add_end(end_position, &template_element.span);
  }
}
