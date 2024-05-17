use swc_ecma_ast::{BindingIdent, Ident};

use crate::convert_ast::converter::ast_constants::{
  IDENTIFIER_NAME_OFFSET, IDENTIFIER_RESERVED_BYTES, IDENTIFIER_TYPE_ANNOTATION_OFFSET,
  TYPE_IDENTIFIER,
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
    let end_position = self.add_type_and_start(
      &TYPE_IDENTIFIER,
      &binding_identifier.id.span,
      IDENTIFIER_RESERVED_BYTES,
      false,
    );
    // name
    self.convert_string(
      &binding_identifier.id.sym,
      end_position + IDENTIFIER_NAME_OFFSET,
    );
    // typeAnnotation
    if let Some(ref type_annotation) = binding_identifier.type_ann {
      self.update_reference_position(end_position + IDENTIFIER_TYPE_ANNOTATION_OFFSET);
      self.convert_type_annotation(type_annotation);
      // end
      self.add_end(end_position, &type_annotation.span);
    } else {
      // end
      self.add_end(end_position, &binding_identifier.span);
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
