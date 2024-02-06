use crate::{
    http_request::{ HttpRequest},
    state::{CanvasState, EditsState, COOLDOWN},
};
use api::management_canister::http_request::HttpResponse;
use candid::*;
use ic_cdk::{api::{self, management_canister::http_request::HttpHeader}, query, storage, update};
use image::{GenericImageView, Pixel};
use serde::Deserialize;
use std::{
    collections::{BTreeMap, HashMap, HashSet},
};

use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use std::cell::RefCell;

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    // The memory manager is used for simulating multiple memories. Given a `MemoryId` it can
    // return a memory that can be used by stable structures.
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // Initialize a `StableBTreeMap` with `MemoryId(0)`.
    static TIME: RefCell<StableBTreeMap<u128, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );
    // Initialize a `StableBTreeMap` with `MemoryId(1)`.
    static CANVAS_STATE: RefCell<StableBTreeMap<u128, CanvasState, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );
    // Initialize a `StableBTreeMap` with `MemoryId(2)`.
    static EDITS_STATE: RefCell<StableBTreeMap<u128, EditsState, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))),
        )
    );
}

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

const TIME_KEY: u128 = 0;

#[candid_method(query)]
#[query]
pub fn time_left() -> u64 {
    TIME.with(|t| t.borrow().get(&TIME_KEY).unwrap())
}

#[candid_method(query)]
#[query]
pub fn check_cooldown() -> u64 {
    return COOLDOWN;
}

#[candid_method(query)]
#[query]
pub fn cycles() -> u64 {
    return ic_cdk::api::canister_balance();
}

// Don't share this with the candid interface
// #[candid_method(query)]
// #[query]
// pub fn backup_edits() -> HashMap<Principal, u64> {
//     let edits = MAP.borrow_mut::<EditsState>();
//     return edits.edits.clone();
// }



#[candid_method(query)]
#[query]
pub fn http_request(request: HttpRequest) -> HttpResponse {
    // /tile.<tile_idx>.png
    let resp = if request.url.starts_with("/tile.") {
        let canvas: CanvasState = CANVAS_STATE.with(|c| c.borrow().get(&0).unwrap().clone());
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
                    status: Nat::from(200 as u64),
                    headers: png_header_fields(&tile_png),
                    body: tile_png,
                })
            }
        }
    } else if request.url.starts_with("/overview.png") {
        let canvas = CANVAS_STATE.with(|c| c.borrow().get(&0).unwrap().clone());
        let overview_png = canvas.overview_image.clone();
        Some(HttpResponse {
            status: Nat::from(200 as u64),
            headers: png_header_fields(&overview_png),
            body: overview_png,
        })
    } else {
        None
    };

    resp.unwrap_or_else(|| HttpResponse {
        status: Nat::from(404 as u64),
        headers: vec![],
        body: request.body.to_vec(),
    })
}

#[candid_method(update)]
#[update]
fn update_overview() {
    let mut canvas = CANVAS_STATE.with(|c| c.borrow().get(&0).unwrap().clone());
    canvas.update_overview();
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct PixelUpdate {
    tile_idx: u32,
    pos: Position,
    color: Color,
}

#[candid_method(update)]
#[update]
fn update_pixel(pixel: PixelUpdate) {
    let mut canvas = CANVAS_STATE.with(|c| c.borrow().get(&0).unwrap().clone());
    let mut edits = EDITS_STATE.with(|e| e.borrow().get(&0).unwrap().clone());
    if edits
        .register_edit(ic_cdk::caller(), ic_cdk::api::time())
        .is_ok()
    {
        canvas.update_pixel(pixel.tile_idx, pixel.pos, pixel.color);
    }
}

#[ic_cdk::init]
fn init() {
    ic_cdk::println!("initializing...");
}

// #[export_name = "canister_pre_upgrade"]
// fn canister_pre_upgrade() {
//     ic_cdk::println!("Executing pre upgrade");
//     let edits = EDITS_STATE.with(|c| c.borrow().get(&0).unwrap().clone());
//     let mut canvas = CANVAS_STATE.with(|c| c.borrow().get(&0).unwrap().clone());
//     canvas.update_overview();
//     storage::stable_save((
//         edits.edits.clone(),
//         edits.start.clone(),
//         edits.pixel_requested.clone(),
//         canvas.tile_images.clone(),
//         canvas.overview_image.clone(),
//     ))
//     .ok();
// }

#[export_name = "canister_post_upgrade"]
fn canister_post_upgrade() {
    ic_cdk::println!("Executing post upgrade");

    let mut edits_state = EDITS_STATE.with(|c| c.borrow().get(&0).unwrap().clone());
    let mut canvas_state = CANVAS_STATE.with(|c| c.borrow().get(&0).unwrap().clone());
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
        canvas_state.raw_tiles = tiles
            .iter()
            .map(|t| image::load_from_memory(t).unwrap())
            .collect();
        canvas_state.raw_overview = image::load_from_memory(&overview).unwrap();

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
    }
}

fn png_header_fields(body: &[u8]) -> Vec<HttpHeader> {
    vec![
        HttpHeader { name: "Content-Type".to_string(), value: "image/png".to_string()},
        HttpHeader{ name: "Content-Length".to_string(), value: body.len().to_string()},
    ]
}
