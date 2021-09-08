use ic_cdk::export::candid::{parser::value::IDLValue, CandidType, Deserialize};
use std::fmt::Debug;

#[derive(Debug, Clone, Copy, Ord, PartialOrd, Eq, PartialEq)]
pub struct HttpRequestCanister;

#[derive(CandidType, Clone, Deserialize)]
pub struct HeaderField(pub String, pub String);

#[derive(CandidType, Deserialize)]
pub struct HttpRequest {
    pub method: String,
    pub url: String,
    pub headers: Vec<HeaderField>,
    //pub body: &'body [u8],
    #[serde(with = "serde_bytes")]
    pub body: Vec<u8>,
}

#[derive(CandidType, Deserialize)]
pub struct CallbackStrategy {
    pub callback: IDLValue,
    pub token: IDLValue,
}

#[derive(CandidType, Deserialize)]
pub enum StreamingStrategy {
    Callback(CallbackStrategy),
}

#[derive(CandidType, Deserialize)]
pub struct HttpResponse {
    pub status_code: u16,
    pub headers: Vec<HeaderField>,
    #[serde(with = "serde_bytes")]
    pub body: Vec<u8>,
    pub streaming_strategy: Option<StreamingStrategy>,
}

#[derive(CandidType, Deserialize)]
pub struct StreamingCallbackHttpResponse {
    #[serde(with = "serde_bytes")]
    pub body: Vec<u8>,
    pub token: Option<IDLValue>,
}
