import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

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
  'pos' : Position,
  'color' : Color,
  'tile_idx' : number,
}
export interface Position { 'x' : number, 'y' : number }
export interface _SERVICE {
  'backup_edits' : ActorMethod<[], Array<[Principal, bigint]>>,
  'check_cooldown' : ActorMethod<[], bigint>,
  'cycles' : ActorMethod<[], bigint>,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'time_left' : ActorMethod<[], bigint>,
  'update_overview' : ActorMethod<[], undefined>,
}
