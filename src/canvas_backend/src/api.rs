use ic_cdk::export::{
    candid::{CandidType, Deserialize},
};
use ic_cdk::storage;
use ic_cdk_macros::*;

use crate::state::CanvasState;

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
fn http_request() {
    // asdf
}

#[update]
fn update_pixel(_tile_index: u32, _pos: Position, _color: Color) {}

#[init]
fn init() {
    let _state = storage::get_mut::<CanvasState>();
}
