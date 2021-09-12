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
export interface Pixel {
  'pos' : Position,
  'color' : Color,
  'tile_idx' : number,
}
export interface Position { 'x' : number, 'y' : number }
export interface _SERVICE {
  'http_request' : (arg_0: HttpRequest) => Promise<HttpResponse>,
  'time_left' : () => Promise<bigint>,
  'update_pixels' : (arg_0: Array<Pixel>) => Promise<undefined>,
}
