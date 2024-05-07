use swc_ecma_ast::ImportStarAsSpecifier;

use crate::convert_ast::converter::ast_constants::{
  IMPORT_NAMESPACE_SPECIFIER_LOCAL_OFFSET, IMPORT_NAMESPACE_SPECIFIER_RESERVED_BYTES,
  TYPE_IMPORT_NAMESPACE_SPECIFIER,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_import_namespace_specifier(
    &mut self,
    import_namespace_specifier: &ImportStarAsSpecifier,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_IMPORT_NAMESPACE_SPECIFIER,
      &import_namespace_specifier.span,
      IMPORT_NAMESPACE_SPECIFIER_RESERVED_BYTES,
      false,
    );
    // local
    self.update_reference_position(end_position + IMPORT_NAMESPACE_SPECIFIER_LOCAL_OFFSET);
    self.convert_identifier(&import_namespace_specifier.local);
    // end
    self.add_end(end_position, &import_namespace_specifier.span);
  }
}
