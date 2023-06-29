import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import * as ast from "./ast.ts";

Deno.test(function toBFCode_basic() {
    assertEquals(ast.toBFCode({type: 'move', delta: 1}), ">", "right 1");
    assertEquals(ast.toBFCode({type: 'move', delta: -1}), "<", "left 1");
    
    assertEquals(ast.toBFCode({type: 'move', delta: 5}), ">>>>>", "right 5");
    assertEquals(ast.toBFCode({type: 'move', delta: -5}), "<<<<<", "left 5");

    assertEquals(ast.toBFCode({type: 'cell', delta: 1}), "+", "inc 1");
    assertEquals(ast.toBFCode({type: 'cell', delta: -1}), "-", "dec 1");

    assertEquals(ast.toBFCode({type: 'cell', delta: 5}), "+++++", "inc 5");
    assertEquals(ast.toBFCode({type: 'cell', delta: -5}), "-----", "dec 5");

    assertEquals(ast.toBFCode({type: 'write'}), ".", "write");
    assertEquals(ast.toBFCode({type: 'read'}), ",", "read");
    assertEquals(ast.toBFCode({type: 'breakpoint'}), "@", "debug");

    assertEquals(ast.toBFCode({type: 'loop', body: []}), "[]", "loop {}");
    assertEquals(ast.toBFCode({type: 'loop', body: [{type: 'loop', body: []}]}), "[[]]", "loop { loop {} }");

    assertEquals(ast.toBFCode([]), "", "empty code");
});

Deno.test(function toBFCode_compound() {
    assertEquals(ast.toBFCode([
        {type: 'move', delta: -1}, {type: 'move', delta: 1}
    ]), "<>", "left right");
    
    assertEquals(ast.toBFCode([
        {type: 'cell', delta: 1}, {type: 'move', delta: 1}, {type: 'cell', delta: -1}, {type: 'move', delta: -1}
    ]), "+>-<", "inc right dec left");

    assertEquals(ast.toBFCode([
        {type: 'cell', delta: 1},
        {type: 'loop', body: [
            {type: 'move', delta: -1},
            {type: 'loop', body: [{type: 'cell', delta: -1}]},
            {type: 'loop', body: [{type: 'move', delta: 2}]},
        ]},
        {type: 'write'},
    ]), "+[<[-][>>]].", "inc loop { left loop { dec } loop { right 2 } } print");
});