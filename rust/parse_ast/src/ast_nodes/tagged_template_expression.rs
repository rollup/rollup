use swc_ecma_ast::TaggedTpl;

use crate::convert_ast::converter::ast_constants::{
  TAGGED_TEMPLATE_EXPRESSION_QUASI_OFFSET, TAGGED_TEMPLATE_EXPRESSION_RESERVED_BYTES,
  TAGGED_TEMPLATE_EXPRESSION_TAG_OFFSET, TYPE_TAGGED_TEMPLATE_EXPRESSION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_tagged_template_expression(&mut self, tagged_template: &TaggedTpl) {
    let end_position = self.add_type_and_start(
      &TYPE_TAGGED_TEMPLATE_EXPRESSION,
      &tagged_template.span,
      TAGGED_TEMPLATE_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // tag
    self.update_reference_position(end_position + TAGGED_TEMPLATE_EXPRESSION_TAG_OFFSET);
    self.convert_expression(&tagged_template.tag);
    // quasi
    self.update_reference_position(end_position + TAGGED_TEMPLATE_EXPRESSION_QUASI_OFFSET);
    self.store_template_literal(&tagged_template.tpl);
    // end
    self.add_end(end_position, &tagged_template.span);
  }
}
