use ic_cdk::{
    export::candid::{CandidType, Deserialize},
    storage,
};
use ic_cdk_macros::*;

use crate::{
    http_request::{HeaderField, HttpRequest, HttpResponse},
    state::CanvasState,
};

/// All images have square shape and the side length must be a power of 2.
pub const IMAGE_SIZE: u32 = 1024;
pub const TILE_SIZE: u32 = 64;
pub const ROW_LENGTH: u32 = IMAGE_SIZE / TILE_SIZE;
pub const NO_TILES: u32 = ROW_LENGTH * ROW_LENGTH;
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
    // /tile.<tile_idx>.png
    let resp = if request.url.starts_with("/tile.") {
        let state = storage::get::<CanvasState>();
        let rem = &request.url[6..];
        match rem.find('.') {
            None => None,
            Some(idx) => {
                let tile_idx = (rem[..idx].parse::<u32>()).expect("parse error");
                let tile_png = state
                    .tile_images
                    .get(tile_idx as usize)
                    .expect("invalid tile")
                    .clone();
                Some(HttpResponse {
                    status_code: 200,
                    headers: png_header_fields(&tile_png),
                    body: tile_png,
                })
            }
        }
    } else if request.url.starts_with("/overview.png") {
        let state = storage::get::<CanvasState>();
        let overview_png = state.overview_image.clone();
        Some(HttpResponse {
            status_code: 200,
            headers: png_header_fields(&overview_png),
            body: overview_png,
        })
    } else {
        None
    };

    resp.unwrap_or_else(|| HttpResponse {
        status_code: 404,
        headers: vec![],
        body: request.body.to_vec(),
    })
}

#[update]
fn update_pixel(tile_idx: u32, pos: Position, color: Color) {
    let state = storage::get_mut::<CanvasState>();
    state.update_pixel(tile_idx, pos, color);
}

#[init]
fn init() {
    let _state = storage::get_mut::<CanvasState>();
}

fn png_header_fields(body: &[u8]) -> Vec<HeaderField> {
    vec![
        HeaderField("Content-Type".to_string(), "image/png".to_string()),
        HeaderField("Content-Length".to_string(), body.len().to_string()),
    ]
}
