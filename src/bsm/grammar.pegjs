Statements = list:(Statement / Comment { return null; } / ";" { return null; })|.., [ \t\n\r]*| { return list.filter((x) => x != null); }

Statement
  = MoveStatement / CellStatement / SetStatement / IOStatement / BreakpointStatement / LoopStatement

MoveStatement
  = op:("left" / "right") delta:(_ delta:Integer { return delta; })?
  { return {type: op, delta: delta ?? 1}; }

CellStatement
  = op:("dec" / "inc") delta:(_ delta:Literal { return delta; })?
  { return {type: op, delta: delta ?? [1]}; }
  
SetStatement
  = "set" _ value:Literal { return {type: 'set', value}; }

IOStatement
  = "read" { return {type: 'read'}; }
  / "write" { return {type: 'write'}; }

BreakpointStatement
  = "debug" { return {type: 'debug'}; }

LoopStatement
  = "loop" _ "{" _ body:Statements _ "}" { return {type: 'loop', body} }

Literal
  = Array / String / Integer
  
Array
  = "[" _ list:List _ "]" { return list; }

List
  = values:Literal|.., CommaDelimiter| CommaDelimiter?  { return values; }

CommaDelimiter
  = _ "," _
  
String
  = "\"" str:([^"\\\r\n] / StringEscape)* "\"" { return str.join(''); }
  / "\'" str:([^"\\\r\n] / StringEscape)* "\'" { return str.join(''); }

StringEscape
  = "\\" escaped:[^xu] { return ({'0': '\x00', 'n': '\n', 'r': '\r', 't': '\t', 'v': '\v'})[escaped] ?? escaped; }
  / "\\x" digits:HexDigit|2| { return String.fromCharCode(parseInt(digits.join(''), 16)); }
  / "\\u" digits:HexDigit|4| { return String.fromCharCode(parseInt(digits.join(''), 16)); }

Integer
  = "-"? ("0x" / "0X") HexDigit+ { return parseInt(text(), 16); }
  / "-"? ("0" / [1-9] [0-9]*) { return parseInt(text()); }

HexDigit
  = [0-9A-Fa-f]

Comment
  = "#" [^\n]*

_ "whitespace"
  = [ \t\n\r]*