import type { Move as BFMove, Cell as BFCell } from "../bf/ast.ts";

/** Replaces a combination of `bf.Move` and `bf.Cell`s */
export interface Cells {
    type: 'cells';
    /** Setting cells' values to zero before applying deltas. */
    clears?: Set<number>;
    /** Changes of cells' values, specified via a map of (offset, delta). */
    deltas?: Map<number, number>;
    /** Amount of pointer shifts after `deltas` and `sets` are processed. */
    offset: number;
}

export type CellMergeable = BFMove | BFCell | Cells;

export function mergeCells(target: Cells, op: CellMergeable): Cells {
    switch(op.type) {
        case 'move':
            target.offset += op.delta;
            break;
        case 'cell': {
            const new_delta = (target.deltas?.get(target.offset) ?? 0) + op.delta;
            if(new_delta === 0) {
                target.deltas?.delete(target.offset);
            } else {
                if(!target.deltas) target.deltas = new Map();
                target.deltas.set(target.offset, new_delta);
            }
            break;
        }
        case 'cells':
            if(op.clears) {
                if(!target.clears) target.clears = new Set();

                for(let offset of op.clears) {
                    offset += target.offset;
                    
                    target.clears?.add(offset);
                    target.deltas?.delete(offset);
                }
            }

            if(op.deltas) {
                for(let [offset, delta] of op.deltas.entries()) {
                    offset += target.offset;
                    delta += target.deltas?.get(offset) ?? 0;

                    if(delta === 0) {
                        target.deltas?.delete(offset);
                    } else {
                        if(!target.deltas) target.deltas = new Map();
                        target.deltas.set(offset, delta);
                    }
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

            if(ast.clears) {
                for(const offset of ast.clears) {
                    toBSMCode_move(lines, curr_indent, offset - curr_offset); curr_offset = offset;

                    const value = ast.deltas?.get(offset) ?? 0;
                    lines.push(`${curr_indent}set ${value}`);
                }
            }
 
            if(ast.deltas) {
                for(const [offset, delta] of ast.deltas.entries()) {
                    if(ast.clears?.has(offset)) continue;
                    toBSMCode_move(lines, curr_indent, offset - curr_offset); curr_offset = offset;
    
                    if(delta > 0) lines.push(`${curr_indent}inc ${delta}`);
                    else if(delta < 0) lines.push(`${curr_indent}dec ${-delta}`);
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