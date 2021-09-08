use ic_cdk::{
    export::candid::{CandidType, Deserialize},
    storage,
};
use ic_cdk_macros::*;

use crate::{
    http_request::{self, HttpRequest, HttpResponse},
    state::CanvasState,
};

/// All images have square shape and the side length must be a power of 2.
pub const OVERVIEW_IMAGE_SIZE: u32 = 512;
pub const IMAGE_SIZE: u32 = 16386;
pub const TILE_SIZE: u32 = 64;
pub const NO_TILES: u32 = (IMAGE_SIZE / TILE_SIZE) * (IMAGE_SIZE / TILE_SIZE);

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct Position {
    x: u32,
    y: u32,
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct Color {
    r: u8,
    g: u8,
    b: u8,
    a: u8,
}

#[query]
pub fn http_request(http_request: HttpRequest) -> HttpResponse {
    HttpResponse {
        status_code: 200,
        headers: vec![],
        body: http_request.body.to_vec(),
    }
}

#[update]
fn update_pixel(_tile_index: u32, _pos: Position, _color: Color) {}

#[init]
fn init() {
    let _state = storage::get_mut::<CanvasState>();
}
