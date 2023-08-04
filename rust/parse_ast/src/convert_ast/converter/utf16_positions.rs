use std::str::Chars;

pub struct Utf8ToUtf16ByteIndexConverter<'a> {
  current_utf8_index: u32,
  current_utf16_index: u32,
  character_iterator: Chars<'a>,
}

impl<'a> Utf8ToUtf16ByteIndexConverter<'a> {
  pub fn new(code: &'a str) -> Self {
    Self {
      current_utf8_index: 0,
      current_utf16_index: 0,
      character_iterator: code.chars(),
    }
  }

  pub fn convert(&mut self, utf8_index: u32) -> u32 {
    if self.current_utf8_index > utf8_index {
      panic!("Cannot convert positions backwards");
    }
    while self.current_utf8_index < utf8_index {
      let character = self.character_iterator.next().unwrap();
      self.current_utf8_index += character.len_utf8() as u32;
      self.current_utf16_index += character.len_utf16() as u32;
    }
    self.current_utf16_index
  }
}
