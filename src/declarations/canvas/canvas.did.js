export const idlFactory = ({ IDL }) => {
  const Image = IDL.Vec(IDL.Vec(IDL.Text));
  const Error = IDL.Variant({
    'InsufficientCycles' : IDL.Null,
    'BadRequest' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  return IDL.Service({
    'getHistory' : IDL.Func([], [IDL.Vec(Image)], ['query']),
    'insertImage' : IDL.Func([Image, IDL.Nat], [Result], []),
    'latest' : IDL.Func([], [Image], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
