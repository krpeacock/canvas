import type { Principal } from '@dfinity/principal';
export type Error = { 'InsufficientCycles' : null } |
  { 'BadRequest' : null };
export type Image = Array<Array<string>>;
export type Result = { 'ok' : [bigint, bigint, bigint] } |
  { 'err' : Error };
export interface _SERVICE {
  'getHistory' : () => Promise<Array<Image>>,
  'latest' : () => Promise<Image>,
  'upload' : (arg_0: Image) => Promise<Result>,
}
