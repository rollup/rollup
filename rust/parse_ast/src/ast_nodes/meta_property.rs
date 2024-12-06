use swc_ecma_ast::{MetaPropExpr, MetaPropKind};

use crate::convert_ast::converter::ast_constants::{
  META_PROPERTY_META_OFFSET, META_PROPERTY_PROPERTY_OFFSET, META_PROPERTY_RESERVED_BYTES,
  TYPE_META_PROPERTY,
};
use crate::convert_ast::converter::AstConverter;

impl AstConverter<'_> {
  pub(crate) fn store_meta_property(&mut self, meta_property_expression: &MetaPropExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_META_PROPERTY,
      &meta_property_expression.span,
      META_PROPERTY_RESERVED_BYTES,
      false,
    );
    match meta_property_expression.kind {
      MetaPropKind::ImportMeta => {
        // meta
        self.update_reference_position(end_position + META_PROPERTY_META_OFFSET);
        self.store_identifier(
          meta_property_expression.span.lo.0 - 1,
          meta_property_expression.span.lo.0 + 5,
          "import",
        );
        // property
        self.update_reference_position(end_position + META_PROPERTY_PROPERTY_OFFSET);
        self.store_identifier(
          meta_property_expression.span.hi.0 - 5,
          meta_property_expression.span.hi.0 - 1,
          "meta",
        );
      }
      MetaPropKind::NewTarget => {
        // meta
        self.update_reference_position(end_position + META_PROPERTY_META_OFFSET);
        self.store_identifier(
          meta_property_expression.span.lo.0 - 1,
          meta_property_expression.span.lo.0 + 2,
          "new",
        );
        // property
        self.update_reference_position(end_position + META_PROPERTY_PROPERTY_OFFSET);
        self.store_identifier(
          meta_property_expression.span.hi.0 - 7,
          meta_property_expression.span.hi.0 - 1,
          "target",
        );
      }
    }
    // end
    self.add_end(end_position, &meta_property_expression.span);
  }
}
