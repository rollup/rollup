use swc_ecma_ast::{TsInterfaceBody, TsInterfaceDecl};
use crate::convert_ast::converter::ast_constants::{TS_INTERFACE_DECLARATION_BODY_OFFSET, TS_INTERFACE_DECLARATION_ID_OFFSET, TS_INTERFACE_DECLARATION_RESERVED_BYTES, TYPE_TS_INTERFACE_DECLARATION};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
    pub fn store_ts_interface_declaration(&mut self, interface_declaration: &Box<TsInterfaceDecl>) {
        let end_position = self.add_type_and_start(
            &TYPE_TS_INTERFACE_DECLARATION,
            &interface_declaration.span,
            TS_INTERFACE_DECLARATION_RESERVED_BYTES,
            false,
        );
        // id
        self.update_reference_position(end_position + TS_INTERFACE_DECLARATION_ID_OFFSET);
        self.convert_identifier(&interface_declaration.id);
        
        // body
        self.update_reference_position(end_position + TS_INTERFACE_DECLARATION_BODY_OFFSET);
        self.store_ts_interface_body(&interface_declaration.body);
        
        // end
        self.add_end(end_position, &interface_declaration.span);
    }
}
