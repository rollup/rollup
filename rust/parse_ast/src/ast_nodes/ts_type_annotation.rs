use swc_ecma_ast::TsTypeAnn;

use crate::convert_ast::converter::ast_constants::{
  TS_TYPE_ANNOTATION_RESERVED_BYTES, TS_TYPE_ANNOTATION_TYPE_ANNOTATION_OFFSET,
  TYPE_TS_TYPE_ANNOTATION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_type_annotation(&mut self, type_annotation: &TsTypeAnn) {
    let end_position = self.add_type_and_start(
      &TYPE_TS_TYPE_ANNOTATION,
      &type_annotation.span,
      TS_TYPE_ANNOTATION_RESERVED_BYTES,
      false,
    );

    // typeAnnotation
    self.update_reference_position(end_position + TS_TYPE_ANNOTATION_TYPE_ANNOTATION_OFFSET);
    self.convert_ts_type(&type_annotation.type_ann);

    // end
    self.add_end(end_position, &type_annotation.span);
  }
}
