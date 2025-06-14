
export interface VoskResult {
  text: string;
  result?: { conf: number; end: number; start: number; word: string }[];
  partial?: string;
}
