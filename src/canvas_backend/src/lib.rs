pub mod api;
pub mod http_request;
pub mod state;

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        panic!("no, it doesn't")
    }
}

#[ic_cdk_macros::query]
fn print() {
    ic_cdk::print("Hello World from DFINITY!");
}
