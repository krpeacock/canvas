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
export interface PixelUpdate {
  pos: Position;
  color: Color;
  tile_idx: number;
}
export interface Position {
  x: number;
  y: number;
}
export interface _SERVICE {
  check_cooldown: () => Promise<bigint>;
  cycles: () => Promise<bigint>;
  http_request: (arg_0: HttpRequest) => Promise<HttpResponse>;
  time_left: () => Promise<bigint>;
  update_overview: () => Promise<undefined>;
  update_pixel: (arg_0: PixelUpdate) => Promise<undefined>;
}
