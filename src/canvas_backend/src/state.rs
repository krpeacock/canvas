use std::{collections::HashMap, time::Duration};

use crate::api::{
    Color, Position, NO_TILES, OVERVIEW_IMAGE_SIZE, OVERVIEW_TILE_SIZE, ROW_LENGTH, TILE_SIZE,
};
use ic_cdk::export::Principal;
use image::{
    imageops::{self, replace, FilterType},
    DynamicImage, Rgba, RgbaImage,
};

#[derive(Clone, Debug)]
pub struct CanvasState {
    pub overview_image: Vec<u8>,
    pub tile_images: Vec<Vec<u8>>,
    pub raw_overview: DynamicImage,
    pub raw_tiles: Vec<RgbaImage>,
}

impl CanvasState {
    pub fn new() -> Self {
        let raw_tiles = (0..NO_TILES)
            .map(|_i| RgbaImage::new(TILE_SIZE, TILE_SIZE))
            .collect();
        Self {
            overview_image: Default::default(),
            tile_images: Default::default(),
            raw_overview: DynamicImage::ImageRgba8(RgbaImage::new(
                OVERVIEW_IMAGE_SIZE,
                OVERVIEW_IMAGE_SIZE,
            )),
            raw_tiles,
        }
    }

    pub fn fetch_tile(&self, tile_idx: u32) -> Vec<u8> {
        self.tile_images
            .get(tile_idx as usize)
            .expect("Invalid tile index")
            .clone()
    }

    pub fn fetch_overview(&self) -> Vec<u8> {
        self.overview_image.clone()
    }

    pub fn update_pixel(&mut self, tile_idx: u32, pos: Position, color: Color) {
        let tile_idx = tile_idx as usize;
        let Position { x, y } = pos;
        let Color { r, g, b, a } = color;
        let rgba = Rgba([r, g, b, a]);
        // update tile
        let raw_tile = self
            .raw_tiles
            .get_mut(tile_idx as usize)
            .expect("Invalid tile index.");
        raw_tile.put_pixel(x, y, rgba);
        let scaled = imageops::resize(raw_tile, TILE_SIZE, TILE_SIZE, FilterType::Gaussian);
        let (ovw_x, ovw_y) = get_tile_offset(tile_idx);
        replace(&mut self.raw_overview, &scaled, ovw_x, ovw_y);

        let mut bytes: Vec<u8> = Vec::new();
        let dyn_image = DynamicImage::ImageRgba8(scaled);
        dyn_image
            .write_to(&mut bytes, image::ImageOutputFormat::Png)
            .expect("Could not encode tile as PNG!");
        *self
            .tile_images
            .get_mut(tile_idx)
            .expect("invalid tile idx") = bytes;

        let mut bytes: Vec<u8> = Vec::new();
        self.raw_overview
            .write_to(&mut bytes, image::ImageOutputFormat::Png)
            .expect("Could not encode overview image.");
        self.overview_image = bytes;
    }
}

impl Default for CanvasState {
    fn default() -> Self {
        Self::new()
    }
}

fn get_tile_offset(tile_idx: usize) -> (u32, u32) {
    let x = (tile_idx as u32 / ROW_LENGTH) * OVERVIEW_TILE_SIZE;
    let y = (tile_idx as u32 % ROW_LENGTH) * OVERVIEW_TILE_SIZE;
    (x, y)
}

#[derive(Clone, Debug, Default)]
pub struct EditsState {
    start: Option<u64>,
    edits: HashMap<Principal, u64>,
}

impl EditsState {
    pub fn new() -> Self {
        Self {
            ..Default::default()
        }
    }

    pub fn register_edit(&mut self, principal: Principal, current_time: u64) -> Result<(), &str> {
        let last_edit = self.edits.get(&principal);
        if last_edit.is_none()
            || Duration::from_secs(30) < Duration::from_nanos(current_time - last_edit.unwrap())
        {
            self.edits.insert(principal, current_time);
            Ok(())
        } else {
            Err("cooling period didn't expire yet")
        }
    }

    pub fn start(&mut self) -> Result<(), &str> {
        if let Some(_) = self.start {
            Err("already started")
        } else {
            self.start = Some(ic_cdk::api::time());
            Ok(())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{ops::Add, str::FromStr};

    #[test]
    fn test_can_edit() {
        let mut edit_state = EditsState::new();
        let principal =
            Principal::from_str("ohfen-bx4r6-bgfvo-lelhh-rdpuc-wgv5u-a2odj-nzoaf-x3laa-e3hhb-qae")
                .unwrap();
        let now = Duration::from_secs(0);
        assert!(edit_state
            .register_edit(principal, now.add(Duration::from_secs(5)).as_nanos() as u64)
            .is_ok());
        assert!(edit_state
            .register_edit(
                principal,
                now.add(Duration::from_secs(15)).as_nanos() as u64
            )
            .is_err());
        assert!(edit_state
            .register_edit(
                principal,
                now.add(Duration::from_secs(36)).as_nanos() as u64
            )
            .is_ok());
    }
}
