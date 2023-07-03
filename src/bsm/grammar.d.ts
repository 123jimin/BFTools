export type Statements = Statement[];
export type Statement = MoveStatement | CellStatement | SetStatement | IOStatement | BreakpointStatement | LoopStatement;
export type MoveStatement = { type: 'left'|'right', delta: number };
export type CellStatement = { type: 'dec'|'inc', delta: Literal };
export type SetStatement = { type: 'set', value: Literal };
export type IOStatement = { type: 'read'|'write' };
export type BreakpointStatement = { type: 'debug' };
export type LoopStatement = { type: 'loop', body: Statements };

export type Literal = Array | string | number;
export type Array = Literal[];

export type SyntaxError = Error & { expected: unknown, found: unknown, location: unknown, name: 'SyntaxError' };
export type Options = Record<string, unknown>;

declare const grammar : {
    parse: (input: string, options?: Partial<Options>) => Statements,
};
export default grammar;