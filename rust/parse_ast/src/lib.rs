use std::panic::{catch_unwind, AssertUnwindSafe};

use swc_common::sync::Lrc;
use swc_common::{FileName, FilePathMapping, Globals, SourceMap, GLOBALS};
use swc_compiler_base::parse_js;
use swc_config::is_module::IsModule;
use swc_ecma_ast::EsVersion;
use swc_ecma_parser::{EsSyntax, Syntax};

use convert_ast::converter::AstConverter;
use error_emit::try_with_handler;

use crate::ast_nodes::panic_error::get_panic_error_buffer;
use crate::convert_ast::annotations::SequentialComments;

mod ast_nodes;
mod convert_ast;
mod error_emit;

/// With `swap_byte_order`, the 32-bit fields of the buffer are written in the opposite of the
/// native byte order. The WASM build, whose byte order is always little-endian, uses this on
/// big-endian hosts because the JS side reads the buffer in the byte order of the host. Strings and
/// the f64 values, which are always little-endian, are not affected.
pub fn parse_ast(
  code: String,
  allow_return_outside_function: bool,
  jsx: bool,
  swap_byte_order: bool,
) -> Vec<u8> {
  let cm = Lrc::new(SourceMap::new(FilePathMapping::empty()));
  let target = EsVersion::EsNext;
  let syntax = Syntax::Es(EsSyntax {
    allow_return_outside_function,
    import_attributes: true,
    explicit_resource_management: true,
    decorators: true,
    decorators_before_export: true,
    jsx,
    ..Default::default()
  });

  let filename = FileName::Anon;
  let file = cm.new_source_file(filename.into(), code);
  let code_reference = file.src.clone();
  let comments = SequentialComments::default();
  GLOBALS.set(&Globals::default(), || {
    let result = catch_unwind(AssertUnwindSafe(|| {
      let result = try_with_handler(&code_reference, swap_byte_order, |handler| {
        parse_js(
          cm,
          file,
          handler,
          target,
          syntax,
          IsModule::Unknown,
          Some(&comments),
        )
      });
      match result {
        Err(buffer) => buffer,
        Ok(program) => {
          let annotations = comments.take_annotations();
          let converter = AstConverter::new(&code_reference, &annotations, swap_byte_order);
          converter.convert_ast_to_buffer(&program)
        }
      }
    }));
    result.unwrap_or_else(|err| {
      let msg = if let Some(msg) = err.downcast_ref::<&str>() {
        msg
      } else if let Some(msg) = err.downcast_ref::<String>() {
        msg
      } else {
        "Unknown rust panic message"
      };
      get_panic_error_buffer(msg, swap_byte_order)
    })
  })
}

#[cfg(test)]
mod tests {
  use super::parse_ast;
  use crate::convert_ast::converter::ast_constants::PARSE_ERROR_RESERVED_BYTES;
  use crate::convert_ast::converter::string_constants::STRING_PURE;

  const CODE: &str = "const number = -1.5, big = 2 ** 53, small = 1e-310, bigint = 123n;
const string = \"héllo, wörld\", template = `${string} ✓`;
const regexp = /[a-z]+/giu;
export default /* @__PURE__ */ Object.freeze({ number, string, regexp });";

  fn find(buffer: &[u8], bytes: &[u8]) -> usize {
    buffer
      .windows(bytes.len())
      .position(|window| window == bytes)
      .unwrap_or_else(|| panic!("{bytes:?} not found in buffer"))
  }

  fn reversed(word: &[u8]) -> Vec<u8> {
    word.iter().rev().copied().collect()
  }

  fn assert_only_32_bit_fields_swapped(native: &[u8], swapped: &[u8]) {
    assert_eq!(native.len(), swapped.len());
    for (index, (native_word, swapped_word)) in native.chunks(4).zip(swapped.chunks(4)).enumerate()
    {
      assert!(
        swapped_word == reversed(native_word) || swapped_word == native_word,
        "word {index} is neither swapped nor raw"
      );
    }
    // the type of the root node is the first 32-bit field
    assert_eq!(swapped[0..4], reversed(&native[0..4])[..]);
  }

  #[test]
  fn swapped_byte_order_keeps_strings_and_f64_values() {
    let native = parse_ast(CODE.to_string(), false, false, false);
    let swapped = parse_ast(CODE.to_string(), false, false, true);
    assert_only_32_bit_fields_swapped(&native, &swapped);
    // string bytes (a string literal, a template element and a regular expression pattern) are
    // kept while the length in front of them is a 32-bit field
    for string in ["héllo, wörld", " ✓", "[a-z]+"] {
      let position = find(&native, string.as_bytes());
      assert_eq!(
        &swapped[position..position + string.len()],
        string.as_bytes()
      );
      assert_eq!(
        swapped[position - 4..position],
        reversed(&native[position - 4..position])[..]
      );
    }
    // f64 values are always little-endian
    for value in [1.5f64, 53.0, 1e-310] {
      let bytes = value.to_le_bytes();
      let position = find(&native, &bytes);
      assert_eq!(swapped[position..position + 8], bytes);
    }
    // annotations are three 32-bit fields: start, end and the index of a fixed string
    let annotation = "/* @__PURE__ */";
    let start = CODE[..CODE.find(annotation).unwrap()]
      .encode_utf16()
      .count() as u32;
    let end = start + annotation.len() as u32;
    let mut native_annotation = start.to_ne_bytes().to_vec();
    native_annotation.extend_from_slice(&end.to_ne_bytes());
    native_annotation.extend_from_slice(&STRING_PURE);
    let position = find(&native, &native_annotation);
    for offset in [0, 4, 8] {
      assert_eq!(
        swapped[position + offset..position + offset + 4],
        reversed(&native_annotation[offset..offset + 4])[..]
      );
    }
  }

  #[test]
  fn swapped_byte_order_applies_to_parse_errors() {
    let native = parse_ast("const = 1;".to_string(), false, false, false);
    let swapped = parse_ast("const = 1;".to_string(), false, false, true);
    assert_only_32_bit_fields_swapped(&native, &swapped);
    // the message string follows the type, start and reserved fields of the ParseError node
    let length_position = 8 + PARSE_ERROR_RESERVED_BYTES;
    assert!(native.len() > length_position + 4);
    assert_eq!(
      swapped[length_position..length_position + 4],
      reversed(&native[length_position..length_position + 4])[..]
    );
    assert_eq!(
      swapped[length_position + 4..],
      native[length_position + 4..]
    );
  }
}
