export const idlFactory = ({ IDL }) => {
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'status_code' : IDL.Nat16,
  });
  const Position = IDL.Record({ 'x' : IDL.Nat32, 'y' : IDL.Nat32 });
  const Color = IDL.Record({
    'a' : IDL.Nat8,
    'b' : IDL.Nat8,
    'g' : IDL.Nat8,
    'r' : IDL.Nat8,
  });
  const Pixel = IDL.Record({
    'pos' : Position,
    'color' : Color,
    'tile_idx' : IDL.Nat32,
  });
  return IDL.Service({
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'update_pixels' : IDL.Func([IDL.Vec(Pixel)], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
