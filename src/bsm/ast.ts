import type { Move as BFMove, Cell as BFCell } from "../bf/ast.ts";

/** Replaces a combination of `bf.Move` and `bf.Cell`s */
export interface Cells {
    type: 'cells';
    /** Changes of cells' values, specified via a map of (offset, delta). */
    deltas?: Map<number, number>;
    /** Setting cells' values, specified via a map of (offset, value). */
    sets?: Map<number, number>;
    /** Amount of pointer shifts after `deltas` and `sets` are processed. */
    offset: number;
}

export function mergeCells(target: Cells, op: BFMove | BFCell | Cells): Cells {
    switch(op.type) {
        case 'move':
            target.offset += op.delta;
            break;
        case 'cell':
            if(target.sets?.has(target.offset)) {
                target.sets.set(target.offset, target.sets.get(target.offset)! + op.delta);
            }
            break;
        case 'cells':
            if(op.deltas) {
                for(let [offset, value] of op.deltas.entries()) {
                    offset += target.offset;
                    
                    if(target.sets?.has(offset)) {
                        target.sets.set(offset, target.sets.get(offset)! + value);
                        continue;
                    }
                    
                    if(!target.deltas) target.deltas = new Map();
                    target.deltas.set(offset, (target.deltas.get(offset) ?? 0) + value);
                }
            }

            if(op.sets) {
                for(let [offset, value] of op.sets.entries()) {
                    offset += target.offset;
                    
                    if(target.deltas?.has(offset)) target.deltas.delete(offset);

                    if(!target.sets) target.sets = new Map();
                    target.sets.set(offset, (target.sets.get(offset) ?? 0) + value);
                }
            }

            target.offset += op.offset;
            break;
    }

    return target;
}

/** Equivalent to either `.` or `,` */
export interface IO {
    type: 'write' | 'read';
}

/** Equivalent to @ (supported on some BF interpreters) */
export interface Breakpoint {
    type: 'breakpoint';
}

/** Equivalent to `[ ... ]` */
export interface Loop {
    type: 'loop';
    body: AST;
}

export type AST = Cells | IO | Breakpoint | Loop | AST[];

export interface ToBSMCodeOption {
    indent: string,
}

const DEFAULT_INDENT = "    ";

function toBSMCode_move(lines: string[], curr_indent: string, offset: number): void {
    if(offset > 0) lines.push(`${curr_indent}right ${offset}`);
    else if(offset < 0) lines.push(`${curr_indent}left ${-offset}`);
}

function toBSMCode_inner(ast: AST, curr_indent: string, option?: Partial<ToBSMCodeOption>): string[] {
    if(Array.isArray(ast)) return ([] as string[]).concat(...ast.map((child) => toBSMCode_inner(child, curr_indent, option)));

    switch(ast.type) {
        case 'cells': {
            // TODO: optimize
            const lines: string[] = [];
            let curr_offset = 0;

            if(ast.deltas) {
                for(const [offset, delta] of ast.deltas.entries()) {
                    toBSMCode_move(lines, curr_indent, offset - curr_offset); curr_offset = offset;
    
                    if(delta > 0) lines.push(`${curr_indent}inc ${delta}`);
                    else if(delta < 0) lines.push(`${curr_indent}dec ${-delta}`);
                }
            }

            if(ast.sets) {
                for(const [offset, value] of ast.sets.entries()) {
                    toBSMCode_move(lines, curr_indent, offset - curr_offset); curr_offset = offset;
    
                    lines.push(`${curr_indent}set ${value}`);
                }
            }

            toBSMCode_move(lines, curr_indent, ast.offset - curr_offset);
            return lines;
        }
        case 'write':
            return [`${curr_indent}write`];
        case 'read':
            return [`${curr_indent}read`];
        case 'breakpoint':
            return [`${curr_indent}debug`];
        case 'loop':
            return [`${curr_indent}loop {`, ...toBSMCode_inner(ast.body, `${curr_indent}${option?.indent ?? DEFAULT_INDENT}`, option), `${curr_indent}}`];
    }
}

export function toBSMCode(ast: AST, option?: Partial<ToBSMCodeOption>): string {
    return toBSMCode_inner(ast, '', option).join("\n");
}