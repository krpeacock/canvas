export const idlFactory = ({ IDL }) => {
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });
  const HttpHeader = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const HttpResponse = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HttpHeader),
  });
  const Position = IDL.Record({ 'x' : IDL.Nat32, 'y' : IDL.Nat32 });
  const Color = IDL.Record({
    'a' : IDL.Nat8,
    'b' : IDL.Nat8,
    'g' : IDL.Nat8,
    'r' : IDL.Nat8,
  });
  const PixelUpdate = IDL.Record({
    'pos' : Position,
    'color' : Color,
    'tile_idx' : IDL.Nat32,
  });
  return IDL.Service({
    'check_cooldown' : IDL.Func([], [IDL.Nat64], ['query']),
    'cycles' : IDL.Func([], [IDL.Nat64], ['query']),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'time_left' : IDL.Func([], [IDL.Nat64], ['query']),
    'update_overview' : IDL.Func([], [], []),
    'update_pixel' : IDL.Func([PixelUpdate], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
