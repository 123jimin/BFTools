import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import * as parser from "./parser.ts";
import * as ast from "./ast.ts";

Deno.test(function parse_toBFCode() {
    const roundtrip = (code: string) => ast.toBFCode(parser.parse(code));
    assertEquals(roundtrip(""), "", "empty code");

    assertEquals(roundtrip("+"), "+", "inc");
    assertEquals(roundtrip("+++++"), "+++++", "inc 5");

    assertEquals(roundtrip("-"), "-", "dec");
    assertEquals(roundtrip("-----"), "-----", "dec 5");
    
    assertEquals(roundtrip(">"), ">", "right");
    assertEquals(roundtrip(">>>>>"), ">>>>>", "right 5");
    
    assertEquals(roundtrip("<"), "<", "left");
    assertEquals(roundtrip("<<<<<"), "<<<<<", "left 5");
    
    assertEquals(roundtrip(".,.,."), ".,.,.", "write read write read write");
    assertEquals(roundtrip("++++++++[->++++++++<]"), "++++++++[->++++++++<]", "init [0, 64]");
});