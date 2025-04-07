export interface TerminalLine {
    type: 'input' | 'output';
    text: string;
    active: boolean;
}
