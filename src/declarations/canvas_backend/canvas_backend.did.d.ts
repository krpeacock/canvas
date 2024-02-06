import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Color {
  'a' : number,
  'b' : number,
  'g' : number,
  'r' : number,
}
export interface HttpHeader { 'value' : string, 'name' : string }
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<[string, string]>,
}
export interface HttpResponse {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<HttpHeader>,
}
export interface PixelUpdate {
  'pos' : Position,
  'color' : Color,
  'tile_idx' : number,
}
export interface Position { 'x' : number, 'y' : number }
export interface _SERVICE {
  'check_cooldown' : ActorMethod<[], bigint>,
  'cycles' : ActorMethod<[], bigint>,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'time_left' : ActorMethod<[], bigint>,
  'update_overview' : ActorMethod<[], undefined>,
  'update_pixel' : ActorMethod<[PixelUpdate], undefined>,
}
