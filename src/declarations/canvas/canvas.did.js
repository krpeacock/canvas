export const idlFactory = ({ IDL }) => {
  const Image = IDL.Vec(IDL.Vec(IDL.Text));
  const Error = IDL.Variant({
    'InsufficientCycles' : IDL.Null,
    'BadRequest' : IDL.Null,
  });
  const Result = IDL.Variant({
    'ok' : IDL.Tuple(IDL.Nat, IDL.Nat, IDL.Nat),
    'err' : Error,
  });
  return IDL.Service({
    'getHistory' : IDL.Func([], [IDL.Vec(Image)], ['query']),
    'latest' : IDL.Func([], [Image], ['query']),
    'upload' : IDL.Func([Image], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
