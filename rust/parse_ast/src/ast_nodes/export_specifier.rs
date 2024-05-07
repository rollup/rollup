use swc_ecma_ast::ExportNamedSpecifier;

use crate::convert_ast::converter::ast_constants::{
  EXPORT_SPECIFIER_EXPORTED_OFFSET, EXPORT_SPECIFIER_LOCAL_OFFSET, EXPORT_SPECIFIER_RESERVED_BYTES,
  TYPE_EXPORT_SPECIFIER,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_export_named_specifier(&mut self, export_named_specifier: &ExportNamedSpecifier) {
    let end_position = self.add_type_and_start(
      &TYPE_EXPORT_SPECIFIER,
      &export_named_specifier.span,
      EXPORT_SPECIFIER_RESERVED_BYTES,
      false,
    );
    // local
    self.update_reference_position(end_position + EXPORT_SPECIFIER_LOCAL_OFFSET);
    self.convert_module_export_name(&export_named_specifier.orig);
    // exported
    if let Some(exported) = export_named_specifier.exported.as_ref() {
      self.update_reference_position(end_position + EXPORT_SPECIFIER_EXPORTED_OFFSET);
      self.convert_module_export_name(exported);
    }
    // end
    self.add_end(end_position, &export_named_specifier.span);
  }
}
