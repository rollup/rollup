use swc_common::Spanned;
use swc_ecma_ast::{Class, Ident};

use crate::convert_ast::converter::analyze_code::find_first_occurrence_outside_comment;
use crate::convert_ast::converter::ast_constants::{
  CLASS_DECLARATION_BODY_OFFSET, CLASS_DECLARATION_DECORATORS_OFFSET, CLASS_DECLARATION_ID_OFFSET,
  CLASS_DECLARATION_RESERVED_BYTES, CLASS_DECLARATION_SCOPE_OFFSET_OFFSET,
  CLASS_DECLARATION_SUPER_CLASS_OFFSET, NODE_TYPE_ID_CLASS_DECLARATION,
  NODE_TYPE_ID_CLASS_EXPRESSION, TYPE_CLASS_DECLARATION,
};
use crate::convert_ast::converter::{AstConverter, DeclarationKind, ScopeType};

impl AstConverter<'_> {
  pub(crate) fn store_class_node(
    &mut self,
    node_type: &[u8; 4],
    identifier: Option<&Ident>,
    class: &Class,
    outside_class_span_decorators_insert_position: Option<u32>,
  ) {
    let is_declaration = node_type == &TYPE_CLASS_DECLARATION;
    let walk_entry = if is_declaration {
      self.on_node_enter::<NODE_TYPE_ID_CLASS_DECLARATION>()
    } else {
      self.on_node_enter::<NODE_TYPE_ID_CLASS_EXPRESSION>()
    };
    let end_position = self.add_type_and_start(
      node_type,
      &class.span,
      CLASS_DECLARATION_RESERVED_BYTES,
      false,
    );
    let mut body_start_search = class.span.lo.0 - 1;
    // decorators
    if let Some(outside_class_span_decorators_insert_position) =
      outside_class_span_decorators_insert_position
    {
      self.buffer[end_position + CLASS_DECLARATION_DECORATORS_OFFSET
        ..end_position + CLASS_DECLARATION_DECORATORS_OFFSET + 4]
        .copy_from_slice(&outside_class_span_decorators_insert_position.to_ne_bytes());
    } else {
      self.convert_item_list(
        &class.decorators,
        end_position + CLASS_DECLARATION_DECORATORS_OFFSET,
        |ast_converter, decorator| {
          ast_converter.store_decorator(decorator);
          true
        },
      );
    }

    if !class.decorators.is_empty() {
      body_start_search = class.decorators.last().unwrap().span.hi.0 - 1;
    }
    // id
    // A ClassDeclaration name binds in the parent/current lexical scope (not the
    // class's own scope), so it is recorded before the ClassScope is pushed. A
    // ClassExpression name, by contrast, binds in the class's own ClassScope
    // and is handled after the scope is pushed below.
    if let (true, Some(identifier)) = (is_declaration, identifier) {
      self.update_reference_position(end_position + CLASS_DECLARATION_ID_OFFSET);
      self.with_declaration_kind(DeclarationKind::Lexical, |ast_converter| {
        ast_converter.convert_identifier(identifier);
      });
      body_start_search = identifier.span.hi.0 - 1;
    }
    self.push_scope(
      ScopeType::Class,
      end_position + CLASS_DECLARATION_SCOPE_OFFSET_OFFSET,
    );
    // A ClassExpression name binds in the class's own ClassScope.
    if let (false, Some(identifier)) = (is_declaration, identifier) {
      self.update_reference_position(end_position + CLASS_DECLARATION_ID_OFFSET);
      self.with_declaration_kind(DeclarationKind::Lexical, |ast_converter| {
        ast_converter.convert_identifier(identifier);
      });
      body_start_search = identifier.span.hi.0 - 1;
    }
    // super_class
    if let Some(super_class) = class.super_class.as_ref() {
      self.update_reference_position(end_position + CLASS_DECLARATION_SUPER_CLASS_OFFSET);
      self.convert_expression(super_class);
      body_start_search = super_class.span().hi.0 - 1;
    }
    // body
    self.update_reference_position(end_position + CLASS_DECLARATION_BODY_OFFSET);
    let class_body_start =
      find_first_occurrence_outside_comment(self.code, b'{', body_start_search);
    self.store_class_body(&class.body, class_body_start, class.span.hi.0 - 1);
    // end
    self.add_end(end_position, &class.span);
    self.pop_scope();
    self.on_node_exit(walk_entry);
  }
}
