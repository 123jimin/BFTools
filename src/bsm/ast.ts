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