use std::{collections::HashMap, io::Cursor, sync::RwLock};

use ic_cdk::{
    export::{
        candid::{candid_method, export_service, CandidType},
        Principal,
    },
    storage,
};
use ic_cdk_macros::*;
use image::DynamicImage;
use serde::{Deserialize, Serialize};

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

#[candid_method(query)]
#[query]
pub fn time_left() -> u64 {
    storage::get::<EditsState>().time_left()
}

#[candid_method(update)]
#[update]
pub fn update_pixels(pixels: Vec<Pixel>) {
    let mut canvas = storage::get_mut::<CanvasState>();
    let mut edits = storage::get_mut::<EditsState>();

    if pixels.len() <= 8 {
        ic_cdk::print(format!("{:?}", pixels.len()));
        if edits
            .register_edit(ic_cdk::caller(), ic_cdk::api::time())
            .is_ok()
        {
            for pixel in pixels {
                ic_cdk::print(format!(
                    "pixel update: x={:?} y=${:?}",
                    pixel.pos.x, pixel.pos.y
                ));
                canvas.update_pixel(pixel.tile_idx, pixel.pos, pixel.color);
            }
        }
    }
    // storage::stable_save(canvas);
    // storage::stable_save(edits);
}

// lazy_static! {
//     pub static ref CANVAS: RwLock<CanvasState> = RwLock::new(CanvasState::new());
//     pub static ref EDITS: RwLock<EditsState> = RwLock::new(EditsState::new());
// }

#[candid_method(init)]
#[init]
fn init() {
    let _canvas = storage::get_mut::<CanvasState>();
    let _edits = storage::get_mut::<EditsState>();
    ic_cdk::println!("initializing...");
}

#[export_name = "canister_pre_upgrade"]
fn canister_pre_upgrade() {
    ic_cdk::println!("Executing pre upgrade");
    let edits = storage::get::<EditsState>();
    let canvas = storage::get::<CanvasState>();
    storage::stable_save((
        edits.edits.clone(),
        edits.start.clone(),
        canvas.tile_images.clone(),
        canvas.overview_image.clone(),
    ))
    .ok();
}

#[export_name = "canister_post_upgrade"]
fn canister_post_upgrade() {
    // dfn_core::printer::hook();
    ic_cdk::println!("Executing post upgrade");

    let edits_state = storage::get_mut::<EditsState>();
    let canvas_state = storage::get_mut::<CanvasState>();
    if let Ok((edits, start, tiles, overview)) =
        storage::stable_restore::<(HashMap<Principal, u64>, Option<u64>, Vec<Vec<u8>>, Vec<u8>)>()
    {
        edits_state.start = start;
        edits_state.edits = edits;
        canvas_state.raw_tiles = tiles
            .iter()
            .map(|t| image::load_from_memory(t).unwrap())
            .collect();
        canvas_state.raw_overview = image::load_from_memory(&overview).unwrap()
    } else {
        ic_cdk::println!("failed to restore state yet again...");
    }
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
