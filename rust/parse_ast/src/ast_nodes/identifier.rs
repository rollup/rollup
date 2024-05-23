use swc_ecma_ast::{BindingIdent, Ident};

use crate::convert_ast::converter::ast_constants::{
  IDENTIFIER_NAME_OFFSET, IDENTIFIER_RESERVED_BYTES, IDENTIFIER_WITH_TYPE_NAME_OFFSET,
  IDENTIFIER_WITH_TYPE_RESERVED_BYTES, IDENTIFIER_WITH_TYPE_TYPE_ANNOTATION_OFFSET,
  TYPE_IDENTIFIER, TYPE_IDENTIFIER_WITH_TYPE,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_identifier(&mut self, start: u32, end: u32, name: &str) {
    let end_position =
      self.add_type_and_explicit_start(&TYPE_IDENTIFIER, start, IDENTIFIER_RESERVED_BYTES);
    // name
    self.convert_string(name, end_position + IDENTIFIER_NAME_OFFSET);
    // end
    self.add_explicit_end(end_position, end);
  }

  pub fn convert_binding_identifier(&mut self, binding_identifier: &BindingIdent) {
    if let Some(ref type_annotation) = binding_identifier.type_ann {
      let end_position = self.add_type_and_start(
        &TYPE_IDENTIFIER_WITH_TYPE,
        &binding_identifier.id.span,
        IDENTIFIER_WITH_TYPE_RESERVED_BYTES,
        false,
      );
      // name
      self.convert_string(
        &binding_identifier.id.sym,
        end_position + IDENTIFIER_WITH_TYPE_NAME_OFFSET,
      );
      // typeAnnotation
      self.update_reference_position(end_position + IDENTIFIER_WITH_TYPE_TYPE_ANNOTATION_OFFSET);
      self.store_type_annotation(type_annotation);
      // end
      self.add_end(end_position, &type_annotation.span);
    } else {
      self.store_identifier(
        binding_identifier.id.span.lo.0 - 1,
        binding_identifier.id.span.hi.0 - 1,
        &binding_identifier.id.sym,
      );
    }
  }

  pub fn convert_identifier(&mut self, identifier: &Ident) {
    self.store_identifier(
      identifier.span.lo.0 - 1,
      identifier.span.hi.0 - 1,
      &identifier.sym,
    );
  }
}
