use crate::convert_ast::converter::ast_constants::{
  TS_PROPERTY_SIGNATURE_COMPUTED_FLAG, TS_PROPERTY_SIGNATURE_KEY_OFFSET,
  TS_PROPERTY_SIGNATURE_OPTIONAL_FLAG, TS_PROPERTY_SIGNATURE_READONLY_FLAG,
  TS_PROPERTY_SIGNATURE_RESERVED_BYTES, TS_PROPERTY_SIGNATURE_STATIC_FLAG,
  TS_PROPERTY_SIGNATURE_TYPE_ANNOTATION_OFFSET, TS_TYPE_ALIAS_DECLARATION_DECLARE_FLAG,
  TS_TYPE_ALIAS_DECLARATION_FLAGS_OFFSET, TS_TYPE_ANNOTATION_RESERVED_BYTES,
  TS_TYPE_ANNOTATION_TYPE_ANNOTATION_OFFSET, TYPE_TS_PROPERTY_SIGNATURE, TYPE_TS_TYPE_ANNOTATION,
};
use crate::convert_ast::converter::AstConverter;
use swc_ecma_ast::TsPropertySignature;

impl<'a> AstConverter<'a> {
  pub fn convert_property_signature(&mut self, signature: &TsPropertySignature) {
    let end_position = self.add_type_and_start(
      &TYPE_TS_PROPERTY_SIGNATURE,
      &signature.span,
      TS_PROPERTY_SIGNATURE_RESERVED_BYTES,
      false,
    );

    // key
    self.update_reference_position(end_position + TS_PROPERTY_SIGNATURE_KEY_OFFSET);
    self.convert_expression(&signature.key);

    // typeAnnotation
    if let Some(ann) = signature.type_ann.as_ref() {
      self.update_reference_position(end_position + TS_PROPERTY_SIGNATURE_TYPE_ANNOTATION_OFFSET);
      self.store_type_annotation(&ann);
    }

    // flags
    let mut flags = 0u32;
    if signature.computed {
      flags |= TS_PROPERTY_SIGNATURE_COMPUTED_FLAG
    }
    if signature.optional {
      flags |= TS_PROPERTY_SIGNATURE_OPTIONAL_FLAG
    }
    if signature.readonly {
      flags |= TS_PROPERTY_SIGNATURE_READONLY_FLAG
    }
    let flags_position = end_position + TS_TYPE_ALIAS_DECLARATION_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());

    // end
    self.add_end(end_position, &signature.span);
  }
}
