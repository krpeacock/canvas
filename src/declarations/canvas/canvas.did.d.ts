import type { Principal } from '@dfinity/principal';
export type Error = { 'InsufficientCycles' : null } |
  { 'BadRequest' : null };
export type Image = Array<Array<string>>;
export type Result = { 'ok' : null } |
  { 'err' : Error };
export interface _SERVICE {
  'getHistory' : () => Promise<Array<Image>>,
  'insertImage' : (arg_0: Image, arg_1: bigint) => Promise<Result>,
  'latest' : () => Promise<Image>,
}
