use swc_ecma_ast::{Class, Ident};

use crate::convert_ast::converter::analyze_code::find_first_occurrence_outside_comment;
use crate::convert_ast::converter::ast_constants::{
  CLASS_DECLARATION_BODY_OFFSET, CLASS_DECLARATION_ID_OFFSET, CLASS_DECLARATION_RESERVED_BYTES,
  CLASS_DECLARATION_SUPER_CLASS_OFFSET,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_class_node(
    &mut self,
    node_type: &[u8; 4],
    identifier: Option<&Ident>,
    class: &Class,
  ) {
    let end_position = self.add_type_and_start(
      node_type,
      &class.span,
      CLASS_DECLARATION_RESERVED_BYTES,
      false,
    );
    let mut body_start_search = class.span.lo.0 - 1;
    // id
    if let Some(identifier) = identifier {
      self.update_reference_position(end_position + CLASS_DECLARATION_ID_OFFSET);
      self.convert_identifier(identifier);
      body_start_search = identifier.span.hi.0 - 1;
    }
    // super_class
    if let Some(super_class) = class.super_class.as_ref() {
      self.update_reference_position(end_position + CLASS_DECLARATION_SUPER_CLASS_OFFSET);
      self.convert_expression(super_class);
      body_start_search = self.get_expression_span(super_class).hi.0 - 1;
    }
    // body
    self.update_reference_position(end_position + CLASS_DECLARATION_BODY_OFFSET);
    let class_body_start =
      find_first_occurrence_outside_comment(self.code, b'{', body_start_search);
    self.store_class_body(&class.body, class_body_start, class.span.hi.0 - 1);
    // end
    self.add_end(end_position, &class.span);
  }
}
