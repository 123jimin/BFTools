export interface StringLiteral {
    type: 'string';
    value: string;
}

export interface NumberLiteral {
    type: 'number';
    value: number;
}

export type SpecialChar = '[' | ']' | '{' | '}' | ',';
export type Keyword = 'left' | 'right' | 'inc' | 'dec' | 'write' | 'read' | 'loop' | 'debug' | 'set' | 'init';
export type Token = StringLiteral | NumberLiteral | SpecialChar | Keyword;

const KEYWORD_SET = new Set(['left', 'right', 'inc', 'dec', 'write', 'read', 'loop', 'debug', 'set', 'init']);
const REGEX_SPECIAL_CHAR = "[\\[\\]{},;]";
const REGEX_KEYWORD = "\\b(?:" + [...KEYWORD_SET].join('|') + ")\\b";
const REGEX_STRING_ESCAPE = `\\\\(?:[^xu]|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4})`;
const REGEX_STRING = `'(?:[^\\\\'\\r\\n]|${REGEX_STRING_ESCAPE})*'|"(?:[^\\\\"\\r\\n]|${REGEX_STRING_ESCAPE})*"`;
const REGEX_NUMBER = `-?\\d+`;
const REGEX_COMMENT = `#[^\\r\\n]*`;
const REGEX_TOKEN = `(${REGEX_SPECIAL_CHAR})|(${REGEX_KEYWORD})|(${REGEX_STRING})|(${REGEX_NUMBER})|(${REGEX_COMMENT})`;

const STRING_ESCAPE_MAP: Record<string, string> = {
    'n': '\n',
    'r': '\r',
    't': '\t',
    'v': '\v',
    '0': '\x00',
};

export class TokenizeError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export function tokenize(code: string): Token[] {
    const tokens: Token[] = [];

    const regex = new RegExp(REGEX_TOKEN, 'g');

    let match: RegExpMatchArray | null = null;
    let last_index = 0;

    while((match = regex.exec(code))) {
        if(match[1]) {
            if(match[1] !== ';') tokens.push(match[1] as SpecialChar);
        } else if(match[2]) {
            tokens.push(match[2] as Keyword)
        } else if(match[3]) {
            tokens.push({type: 'string', value: match[3].slice(1, -1).replace(/\\(?:([^xu])|x([0-9A-Fa-f]{2})|u([0-9A-Fa-f]{4}))/g, (all, escaped, hex2, hex4) => {
                if(escaped) return STRING_ESCAPE_MAP[escaped as string] ?? escaped;
                if(hex2 || hex4) return String.fromCharCode(parseInt(hex2 || hex4, 16));
                return all;
            })});
        } else if(match[4]) {
            tokens.push({type: 'number', value: parseInt(match[4])});
        } else if(match[5]) {
            // Comment
        } else {
            throw new TokenizeError(`Unknown symbol: "${match[0]}" at ${regex.lastIndex}`);
        }
    }
 
    return tokens;
}