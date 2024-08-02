use swc_common::Span;
use swc_ecma_ast::{ExportAll, ModuleExportName, ObjectLit, Str};

use crate::convert_ast::converter::ast_constants::{
  EXPORT_ALL_DECLARATION_ATTRIBUTES_OFFSET, EXPORT_ALL_DECLARATION_EXPORTED_OFFSET,
  EXPORT_ALL_DECLARATION_RESERVED_BYTES, EXPORT_ALL_DECLARATION_SOURCE_OFFSET,
  TYPE_EXPORT_ALL_DECLARATION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_export_all_declaration(
    &mut self,
    span: &Span,
    source: &Str,
    attributes: &Option<Box<ObjectLit>>,
    exported: Option<&ModuleExportName>,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_EXPORT_ALL_DECLARATION,
      span,
      EXPORT_ALL_DECLARATION_RESERVED_BYTES,
      false,
    );
    // exported
    if let Some(exported) = exported {
      self.update_reference_position(end_position + EXPORT_ALL_DECLARATION_EXPORTED_OFFSET);
      self.convert_module_export_name(exported);
    }
    // source
    self.update_reference_position(end_position + EXPORT_ALL_DECLARATION_SOURCE_OFFSET);
    self.store_literal_string(source);
    // attributes
    self.store_import_attributes(
      attributes,
      end_position + EXPORT_ALL_DECLARATION_ATTRIBUTES_OFFSET,
    );
    // end
    self.add_end(end_position, span);
  }

  pub(crate) fn convert_export_all(&mut self, export_all: &ExportAll) {
    self.store_export_all_declaration(&export_all.span, &export_all.src, &export_all.with, None);
  }
}
