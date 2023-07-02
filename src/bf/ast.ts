/** Equivalent to a combination of `<>` */
export interface Move {
    type: 'move';
    delta: number;
}

/** Equivalent to a combination of `+-` */
export interface Cell {
    type: 'cell';
    delta: number;
}

/** Equivalent to either `.` or `,` */
export interface IO {
    type: 'write' | 'read';
}

/** Equivalent to # (supported on some BF interpreters) */
export interface Breakpoint {
    type: 'breakpoint';
}

/** Equivalent to `[ ... ]` */
export interface Loop {
    type: 'loop';
    body: AST;
}

export type AST = Move | Cell | IO | Breakpoint | Loop | AST[];

export interface ToBFCodeOption {
    breakpoint_char: string;
};

export function toBFCode(ast: AST, option?: Partial<ToBFCodeOption>): string {
    if(Array.isArray(ast)) return ast.map((child) => toBFCode(child, option)).join('');

    switch(ast.type) {
        case 'move':
            if(ast.delta > 0) return '>'.repeat(ast.delta);
            else if(ast.delta < 0) return '<'.repeat(-ast.delta);
            else return '';
        case 'cell':
            if(ast.delta > 0) return '+'.repeat(ast.delta);
            else if(ast.delta < 0) return '-'.repeat(-ast.delta);
            else return '';
        case 'write':
            return '.';
        case 'read':
            return ',';
        case 'breakpoint':
            return option?.breakpoint_char ?? '#';
        case 'loop':
            return `[${toBFCode(ast.body, option)}]`;
    }
}