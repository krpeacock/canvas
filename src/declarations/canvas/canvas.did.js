export const idlFactory = ({ IDL }) => {
  const Image = IDL.Vec(IDL.Vec(IDL.Text));
  const SuccessUpdate = IDL.Record({
    'accountBalance' : IDL.Nat,
    'newHeight' : IDL.Nat,
  });
  const Error = IDL.Variant({
    'InsufficientCycles' : IDL.Null,
    'BadRequest' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : SuccessUpdate, 'err' : Error });
  return IDL.Service({
    'getHistory' : IDL.Func([], [IDL.Vec(Image)], ['query']),
    'latest' : IDL.Func([], [Image], ['query']),
    'upload' : IDL.Func([Image], [Result], []),
    'wallet_receive' : IDL.Func([], [IDL.Nat], []),
  });
};
export const init = ({ IDL }) => { return []; };
