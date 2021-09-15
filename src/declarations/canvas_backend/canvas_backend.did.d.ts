import type { Principal } from '@dfinity/principal';
export interface Color {
  'a' : number,
  'b' : number,
  'g' : number,
  'r' : number,
}
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Array<number>,
  'headers' : Array<[string, string]>,
}
export interface HttpResponse {
  'body' : Array<number>,
  'headers' : Array<[string, string]>,
  'status_code' : number,
}
export interface Position { 'x' : number, 'y' : number }
export interface _SERVICE {
  'backup_edits' : () => Promise<Array<[Principal, bigint]>>,
  'check_cooldown' : () => Promise<bigint>,
  'cycles' : () => Promise<bigint>,
  'http_request' : (arg_0: HttpRequest) => Promise<HttpResponse>,
  'time_left' : () => Promise<bigint>,
  'update_pixel' : (arg_0: number, arg_1: Position, arg_2: Color) => Promise<
      undefined
    >,
}
