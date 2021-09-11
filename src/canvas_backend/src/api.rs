use serde::{Deserialize, Serialize};
use ic_cdk::{
    export::candid::{candid_method, export_service, CandidType},
    storage,
};
use ic_cdk_macros::*;

use crate::{
    http_request::{HeaderField, HttpRequest, HttpResponse},
    state::{CanvasState, EditsState},
};

/// All images have square shape and the side length must be a power of 2.
pub const IMAGE_SIZE: u32 = 1024;
pub const TILE_SIZE: u32 = 64;
pub const ROW_LENGTH: u32 = IMAGE_SIZE / TILE_SIZE;
pub const NO_TILES: u32 = ROW_LENGTH * ROW_LENGTH;
pub const OVERVIEW_IMAGE_SIZE: u32 = 1024;
pub const OVERVIEW_TILE_SIZE: u32 = OVERVIEW_IMAGE_SIZE / ROW_LENGTH;

#[derive(Clone, Debug, Default, CandidType, Deserialize, Serialize)]
pub struct Position {
    pub x: u32,
    pub y: u32,
}

#[derive(Clone, Debug, Default, CandidType, Deserialize, Serialize)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct Pixel {
    pub tile_idx: u32,
    pub pos: Position,
    pub color: Color,
}


#[candid_method(query)]
#[query]
pub fn http_request(request: HttpRequest) -> HttpResponse {
    // /tile.<tile_idx>.png
    let resp = if request.url.starts_with("/tile.") {
        let canvas = storage::get::<CanvasState>();
        let rem = &request.url[6..];
        match rem.find('.') {
            None => None,
            Some(idx) => {
                let tile_idx = (rem[..idx].parse::<u32>()).expect("parse error");
                let tile_png = canvas
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
        let canvas = storage::get::<CanvasState>();
        let overview_png = canvas.overview_image.clone();
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

#[candid_method(update)]
#[update]
fn update_pixels(pixels: Vec<Pixel>) {
    let canvas = storage::get_mut::<CanvasState>();
    let edits = storage::get_mut::<EditsState>();

    if pixels.len() <= 8 {
        ic_cdk::print(format!("{:?}", pixels.len()));
        if edits
        .register_edit(ic_cdk::caller(), ic_cdk::api::time())
        .is_ok()
        {
            for pixel in pixels {
                ic_cdk::print(format!("pixel update: x={:?} y=${:?}", pixel.pos.x, pixel.pos.y));
                canvas.update_pixel(pixel.tile_idx, pixel.pos, pixel.color);
            }
        }
    }
}

#[init]
fn init() {
    let _canvas = storage::get_mut::<CanvasState>();
    let _edits = storage::get_mut::<EditsState>();
    _edits.start().ok();
}

fn png_header_fields(body: &[u8]) -> Vec<HeaderField> {
    vec![
        HeaderField("Content-Type".to_string(), "image/png".to_string()),
        HeaderField("Content-Length".to_string(), body.len().to_string()),
    ]
}

export_service!();

#[ic_cdk_macros::query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}
