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
  return IDL.Service({
    'backup_edits' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat64))],
        ['query'],
      ),
    'check_cooldown' : IDL.Func([], [IDL.Nat64], ['query']),
    'cycles' : IDL.Func([], [IDL.Nat64], ['query']),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'time_left' : IDL.Func([], [IDL.Nat64], ['query']),
    'update_overview' : IDL.Func([], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
