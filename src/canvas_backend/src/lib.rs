pub mod api;
pub mod http_request;
pub mod state;

#[ic_cdk_macros::query]
fn print() {
    ic_cdk::print("Hello World from DFINITY!");
}
