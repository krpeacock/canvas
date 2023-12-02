use ic_cdk::{
    export::{
        candid::{candid_method, export_service, CandidType},
        Principal,
    },
    storage,
    caller,
    api,
};
use ic_cdk_macros::*;
use image::{GenericImageView, Pixel};

use crate::{
    http_request::{HeaderField, HttpRequest, HttpResponse},
    state::{CanvasState, EditsState, COOLDOWN},
    address::{AddressBook, AddressEntry, Role},
};
use serde::Deserialize;
use std::collections::{HashMap, HashSet};

/// All images have square shape and the side length must be a power of 2.
pub const IMAGE_SIZE: u32 = 1024;
pub const TILE_SIZE: u32 = 64;
pub const ROW_LENGTH: u32 = IMAGE_SIZE / TILE_SIZE;
pub const NO_TILES: u32 = ROW_LENGTH * ROW_LENGTH;
pub const OVERVIEW_IMAGE_SIZE: u32 = 1024;
pub const OVERVIEW_TILE_SIZE: u32 = OVERVIEW_IMAGE_SIZE / ROW_LENGTH;

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

#[candid_method(query)]
#[query]
pub fn time_left() -> u64 {
    storage::get::<EditsState>().time_left()
}

#[candid_method(query)]
#[query]
pub fn check_cooldown() -> u64 {
    return COOLDOWN;
}

#[candid_method(query)]
#[query(guard = "is_custodian_or_controller", name = "cycles")]
pub fn cycles() -> u64 {
    return ic_cdk::api::canister_balance();
}

// Don't share this with the candid interface
#[candid_method(query)]
#[query]
pub fn backup_edits(page: usize ) -> Vec<Principal> {
    let edits = storage::get::<EditsState>();
    let mut sorted = edits.edits.clone().into_keys().collect::<Vec<_>>();
    sorted.sort();
    let start = page * 1000;
    let end = start + 1000;
    return sorted[start..end].to_vec();
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
fn update_overview() {
    let canvas = storage::get_mut::<CanvasState>();
    canvas.update_overview();
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
struct PixelUpdate {
    tile_idx: u32, pos: Position, color: Color
}

// #[candid_method(update)]
// #[update]
// fn update_pixel(pixel: PixelUpdate) {
    // let canvas = storage::get_mut::<CanvasState>();
    // let edits = storage::get_mut::<EditsState>();
    // if edits
    //     .register_edit(ic_cdk::caller(), ic_cdk::api::time())
    //     .is_ok()
    // {
    //     canvas.update_pixel(pixel.tile_idx, pixel.pos, pixel.color);
    // }
// }

#[init]
fn init() {
    let _canvas = storage::get_mut::<CanvasState>();
    let _edits = storage::get_mut::<EditsState>();
    add_address(AddressEntry::new(caller(), None, Role::Controller));
    ic_cdk::println!("initializing...");
}

#[export_name = "canister_pre_upgrade"]
fn canister_pre_upgrade() {
    ic_cdk::println!("Executing pre upgrade");
    let edits = storage::get::<EditsState>();
    let canvas = storage::get_mut::<CanvasState>();
    let address_book = storage::get::<AddressBook>();
    canvas.update_overview();
    storage::stable_save((
        edits.edits.clone(),
        edits.start.clone(),
        edits.pixel_requested.clone(),
        canvas.tile_images.clone(),
        canvas.overview_image.clone(),
    ))
    .ok();
}

#[export_name = "canister_post_upgrade"]
fn canister_post_upgrade() {
    ic_cdk::println!("Executing post upgrade");

    let edits_state = storage::get_mut::<EditsState>();
    let canvas_state = storage::get_mut::<CanvasState>();
    let address_book = storage::get_mut::<AddressBook>();

    for entry in storage.address_book.into_iter() {
        address_book.insert(entry)
    }

    add_address(AddressEntry::new(caller(), None, Role::Controller));

    if let Ok((edits, start, pixel_requested, tiles, overview)) = storage::stable_restore::<(
        HashMap<Principal, u64>,
        Option<u64>,
        HashSet<Principal>,
        Vec<Vec<u8>>,
        Vec<u8>,
    )>() {
        edits_state.start = start;
        edits_state.edits = edits;
        edits_state.pixel_requested = pixel_requested;
        // restore_canvas(canvas_state);
        // return;

        canvas_state.raw_tiles = tiles
            .iter()
            .map(|t| image::load_from_memory(t).unwrap())
            .collect();
        canvas_state.tile_images = tiles;

        canvas_state.raw_overview = image::load_from_memory(&overview).unwrap();
        canvas_state.overview_image = overview;

        // Update one pixel to complete refresh of preview
        let x: u32 = 0;
        let y: u32 = 0;
        let pos = Position { x, y };
        canvas_state.update_pixel(
            0,
            pos,
            Color {
                r: canvas_state.raw_overview.get_pixel(x, y).to_rgba().0[0],
                g: canvas_state.raw_overview.get_pixel(x, y).to_rgba().0[1],
                b: canvas_state.raw_overview.get_pixel(x, y).to_rgba().0[2],
                a: canvas_state.raw_overview.get_pixel(x, y).to_rgba().0[3],
            },
        );
        canvas_state.update_overview();

        // TODO: To reset the start time, uncomment, deploy, comment out again, and redeploy.
        // edits_state.start = None;
    } else {
        ic_cdk::println!("failed to restore state.");
    };
}

fn restore_canvas(canvas: &mut CanvasState) {
    // let canvas = storage::get_mut::<CanvasState>();
    let image = include_bytes!("backup.png");
    canvas.raw_overview = image::load_from_memory(image).unwrap();
    canvas.overview_image = image.to_vec();
    canvas.tile_images = vec![];
    canvas.raw_tiles = vec![];
    (0..256).for_each(|i| {
        let (x, y) = super::state::get_tile_offset(i);
        let raw_tile = canvas.raw_overview.crop_imm(x, y, 64, 64);
        canvas.raw_tiles.push(raw_tile.clone());

        let mut bytes: Vec<u8> = Vec::new();
        raw_tile
            .write_to(&mut bytes, image::ImageOutputFormat::Png)
            .expect("Could not encode tile as PNG!");
        canvas.tile_images.push(bytes);
    });
}

fn png_header_fields(body: &[u8]) -> Vec<HeaderField> {
    vec![
        HeaderField("Content-Type".to_string(), "image/png".to_string()),
        HeaderField("Content-Length".to_string(), body.len().to_string()),
    ]
}

export_service!();

// #[ic_cdk_macros::query(name = "__get_candid_interface_tmp_hack")]
// fn export_candid() -> String {
//     __export_service()
// }


/***************************************************************************************************
 * Utilities
 **************************************************************************************************/

// Address book
#[update(guard = "is_controller")]
fn add_address(address: AddressEntry) {
    storage::get_mut::<AddressBook>().insert(address.clone());
}

/// Authorize a custodian.
#[update(guard = "is_controller")]
fn authorize(custodian: Principal) {
    add_address(AddressEntry::new(custodian, None, Role::Custodian));
}


/// Check if the caller is the initializer.
fn is_controller() -> Result<(), String> {
    if storage::get::<AddressBook>().is_controller(&caller()) {
        Ok(())
    } else {
        Err("Only the controller can call this method.".to_string())
    }
}

/// Check if the caller is a custodian.
fn is_custodian_or_controller() -> Result<(), String> {
    let caller = &caller();
    if storage::get::<AddressBook>().is_controller_or_custodian(caller) || &api::id() == caller {
        Ok(())
    } else {
        Err("Only a controller or custodian can call this method.".to_string())
    }
}
