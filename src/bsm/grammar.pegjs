Statements = (Statement / Comment / ";")|.., [ \t\n\r]*|

Statement
  = MoveStatement / CellStatement / SetStatement / IOStatement / BreakpointStatement / LoopStatement

MoveStatement
  = op:("left" / "right") (_ delta:Integer)?

CellStatement
  = op:("dec" / "inc") (_ delta:Literal)?
  
SetStatement
  = "set" _ delta:Literal

IOStatement
  = "read" / "write"

BreakpointStatement
  = "debug"

LoopStatement
  = "loop" _ "{" _ Statements _ "}"

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
  = "\\" [^xu]
  / "\\x" HexDigit|2|
  / "\\u" HexDigit|4|

Integer
  = "-" ? ("0" / [1-9] [0-9]*) { return parseInt(text()); }

HexDigit
  = [0-9A-Fa-f]

Comment
  = "#" [^\n]*

_ "whitespace"
  = [ \t\n\r]*