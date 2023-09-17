pub fn find_first_occurrence_outside_comment(code: &[u8], search_byte: u8, start: u32) -> u32 {
  let mut search_pos = start as usize;
  let mut comment_type = CommentType::None;
  loop {
    match comment_type {
      CommentType::SingleLine => {
        if code[search_pos] == b'\n' {
          comment_type = CommentType::None;
        }
      }
      CommentType::MultiLine => {
        if code[search_pos] == b'*' && code[search_pos + 1] == b'/' {
          comment_type = CommentType::None;
          search_pos += 1;
        }
      }
      CommentType::None => {
        if code[search_pos] == b'/' && code[search_pos + 1] == b'/' {
          comment_type = CommentType::SingleLine;
          search_pos += 1;
        } else if code[search_pos] == b'/' && code[search_pos + 1] == b'*' {
          comment_type = CommentType::MultiLine;
          search_pos += 1;
        } else if code[search_pos] == search_byte {
          return search_pos as u32;
        }
      }
    }
    search_pos += 1;
    if search_pos >= code.len() {
      return code.len().try_into().unwrap();
    }
  }
}

enum CommentType {
  SingleLine,
  MultiLine,
  None,
}
