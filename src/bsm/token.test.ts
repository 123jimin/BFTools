import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { tokenize } from "./token.ts";

Deno.test(function tokenize_single() {
    assertEquals(tokenize('['), ['['], "open square bracket");
    assertEquals(tokenize(','), [','], "comma");
    assertEquals(tokenize('read'), ['read'], "keyword 'read'");
    assertEquals(tokenize('-123'), [{type: 'number', value: -123}], "number -123");
    assertEquals(tokenize('"Hello, world!"'), [{type: 'string', value: "Hello, world!"}], "string hello world");
    assertEquals(tokenize(';'), [], "semicolon");
    assertEquals(tokenize('# Comment'), [], "comment");
});

Deno.test(function tokenize_string() {
    assertEquals(tokenize(`"Hello, world!"`), [{type: 'string', value: 'Hello, world!'}], "string 'Hello, world!'");
    assertEquals(tokenize(`"init"`), [{type: 'string', value: 'init'}], "string 'init'");
    assertEquals(tokenize(`'"'`), [{type: 'string', value: '"'}], "string '\"'");
    assertEquals(tokenize(`"'"`), [{type: 'string', value: '\''}], "string \"'\"");
    assertEquals(tokenize(`"#"`), [{type: 'string', value: '#'}], "string '#'");
});

Deno.test(function tokenize_code() {
    const CODE_1 = `inc 8; loop { right; inc 8; left; dec; }; right inc write`;
    assertEquals(tokenize(CODE_1), [
        'inc', {type: 'number', value: 8},
        'loop', '{',
            'right', 'inc', {type: 'number', value: 8}, 'left', 'dec',
        '}',
        'right', 'inc', 'write',
    ], "test code 1");

    const CODE_2 = "init \"Hello, world!\\0\" loop { write right }";
    assertEquals(tokenize(CODE_2), [
        'init', {type: 'string', value: "Hello, world!\x00"},
        'loop', '{', 'write', 'right', '}',
    ], "test code 2");
});