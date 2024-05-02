use swc_ecma_ast::ClassMember;

use crate::convert_ast::converter::ast_constants::{
  CLASS_BODY_BODY_OFFSET, CLASS_BODY_RESERVED_BYTES, TYPE_CLASS_BODY,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_class_body(&mut self, class_members: &[ClassMember], start: u32, end: u32) {
    let end_position =
      self.add_type_and_explicit_start(&TYPE_CLASS_BODY, start, CLASS_BODY_RESERVED_BYTES);
    let class_members_filtered: Vec<&ClassMember> = class_members
      .iter()
      .filter(|class_member| !matches!(class_member, ClassMember::Empty(_)))
      .collect();
    // body
    self.convert_item_list(
      &class_members_filtered,
      end_position + CLASS_BODY_BODY_OFFSET,
      |ast_converter, class_member| {
        ast_converter.convert_class_member(class_member);
        true
      },
    );
    // end
    self.add_explicit_end(end_position, end);
  }
}
