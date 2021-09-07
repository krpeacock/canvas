import type { Principal } from '@dfinity/principal';
export type Error = { 'InsufficientCycles' : null } |
  { 'BadRequest' : null };
export type Image = Array<Array<string>>;
export type Result = { 'ok' : SuccessUpdate } |
  { 'err' : Error };
export interface SuccessUpdate {
  'accountBalance' : bigint,
  'newHeight' : bigint,
}
export interface _SERVICE {
  'getHistory' : () => Promise<Array<Image>>,
  'latest' : () => Promise<Image>,
  'upload' : (arg_0: Image) => Promise<Result>,
  'wallet_receive' : () => Promise<bigint>,
}
