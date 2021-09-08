use ic_cdk::{
    export::candid::{CandidType, Deserialize},
    storage,
};
use ic_cdk_macros::*;

use crate::{
    http_request::{HttpRequest, HttpResponse},
    state::CanvasState,
};

/// All images have square shape and the side length must be a power of 2.
pub const IMAGE_SIZE: u32 = 1024;
pub const TILE_SIZE: u32 = 64;
pub const ROW_LENGTH: u32 = IMAGE_SIZE / TILE_SIZE;
pub const NO_TILES: u32 = ROW_LENGTH;
pub const OVERVIEW_IMAGE_SIZE: u32 = 512;
pub const OVERVIEW_TILE_SIZE: u32 = OVERVIEW_IMAGE_SIZE / (ROW_LENGTH);

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct Position {
    pub x: u32,
    pub y: u32,
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

#[query]
pub fn http_request(request: HttpRequest) -> HttpResponse {
    HttpResponse {
        status_code: 200,
        headers: vec![],
        body: request.body.to_vec(),
    }
}

#[update]
fn update_pixel(_tile_index: u32, _pos: Position, _color: Color) {}

#[init]
fn init() {
    let _state = storage::get_mut::<CanvasState>();
}
