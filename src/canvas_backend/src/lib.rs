pub mod api;
pub mod http_request;
pub mod state;

use crate::http_request::HttpRequest;
use ic_cdk::api::management_canister::http_request::HttpResponse;
use crate::api::PixelUpdate;

ic_cdk::export_candid!();
