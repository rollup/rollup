use swc_ecma_ast::{BlockStmt, Function, Ident, Pat};

use crate::convert_ast::annotations::AnnotationKind;
use crate::convert_ast::converter::ast_constants::{
  FUNCTION_DECLARATION_ANNOTATIONS_OFFSET, FUNCTION_DECLARATION_BODY_OFFSET,
  FUNCTION_DECLARATION_ID_OFFSET, FUNCTION_DECLARATION_PARAMS_OFFSET,
  FUNCTION_DECLARATION_RESERVED_BYTES,
};
use crate::convert_ast::converter::{convert_annotation, AstConverter};
use crate::store_function_declaration_flags;

impl<'a> AstConverter<'a> {
  pub(crate) fn convert_function(
    &mut self,
    function: &Function,
    node_type: &[u8; 4],
    identifier: Option<&Ident>,
  ) {
    let parameters: Vec<&Pat> = function.params.iter().map(|param| &param.pat).collect();
    self.store_function_node(
      node_type,
      function.span.lo.0 - 1,
      function.span.hi.0 - 1,
      function.is_async,
      function.is_generator,
      identifier,
      &parameters,
      function.body.as_ref().unwrap(),
      true,
    );
  }

  #[allow(clippy::too_many_arguments)]
  pub fn store_function_node(
    &mut self,
    node_type: &[u8; 4],
    start: u32,
    end: u32,
    is_async: bool,
    is_generator: bool,
    identifier: Option<&Ident>,
    parameters: &[&Pat],
    body: &BlockStmt,
    observe_annotations: bool,
  ) {
    let end_position =
      self.add_type_and_explicit_start(node_type, start, FUNCTION_DECLARATION_RESERVED_BYTES);
    // flags
    store_function_declaration_flags!(
      self,
      end_position,
      async => is_async,
      generator => is_generator
    );
    // annotations
    if observe_annotations {
      let annotations = self
        .index_converter
        .take_collected_annotations(AnnotationKind::NoSideEffects);
      if !annotations.is_empty() {
        self.convert_item_list(
          &annotations,
          end_position + FUNCTION_DECLARATION_ANNOTATIONS_OFFSET,
          |ast_converter, annotation| {
            convert_annotation(&mut ast_converter.buffer, annotation);
            true
          },
        );
      }
    }
    // id
    if let Some(ident) = identifier {
      self.update_reference_position(end_position + FUNCTION_DECLARATION_ID_OFFSET);
      self.convert_identifier(ident);
    }
    // params
    self.convert_item_list(
      parameters,
      end_position + FUNCTION_DECLARATION_PARAMS_OFFSET,
      |ast_converter, param| {
        ast_converter.convert_pattern(param);
        true
      },
    );
    // body
    self.update_reference_position(end_position + FUNCTION_DECLARATION_BODY_OFFSET);
    self.store_block_statement(body, true);
    // end
    self.add_explicit_end(end_position, end);
  }
}
