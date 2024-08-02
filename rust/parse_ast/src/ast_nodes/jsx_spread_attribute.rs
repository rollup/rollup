use swc_common::Spanned;
use swc_ecma_ast::SpreadElement;

use crate::convert_ast::converter::analyze_code::find_first_occurrence_outside_comment;
use crate::convert_ast::converter::ast_constants::{
  JSX_SPREAD_ATTRIBUTE_ARGUMENT_OFFSET, JSX_SPREAD_ATTRIBUTE_RESERVED_BYTES,
  TYPE_JSX_SPREAD_ATTRIBUTE,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_spread_attribute(
    &mut self,
    spread_element: &SpreadElement,
    previous_element_end: u32,
  ) {
    let end_position = self.add_type_and_explicit_start(
      &TYPE_JSX_SPREAD_ATTRIBUTE,
      find_first_occurrence_outside_comment(self.code, b'{', previous_element_end),
      JSX_SPREAD_ATTRIBUTE_RESERVED_BYTES,
    );
    // argument
    self.update_reference_position(end_position + JSX_SPREAD_ATTRIBUTE_ARGUMENT_OFFSET);
    self.convert_expression(&spread_element.expr);
    // end
    self.add_explicit_end(
      end_position,
      find_first_occurrence_outside_comment(self.code, b'}', spread_element.expr.span().hi.0 - 1)
        + 1,
    );
  }
}
