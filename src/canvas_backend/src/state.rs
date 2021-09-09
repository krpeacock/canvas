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
    pub raw_tiles: Vec<DynamicImage>,
}

impl CanvasState {
    pub fn new() -> Self {
        let raw_tiles = (0..NO_TILES)
            .map(|_i| DynamicImage::ImageRgba8(RgbaImage::new(TILE_SIZE, TILE_SIZE)))
            .collect::<Vec<_>>();

        let tile_images = raw_tiles
            .iter()
            .map(|t| {
                let mut bytes = vec![];
                t.write_to(&mut bytes, image::ImageOutputFormat::Png)
                    .expect("Could not encode tile as PNG!");
                bytes
            })
            .collect();

        let raw_overview =
            DynamicImage::ImageRgba8(RgbaImage::new(OVERVIEW_IMAGE_SIZE, OVERVIEW_IMAGE_SIZE));

        let mut overview_image = vec![];
        raw_overview
            .write_to(&mut overview_image, image::ImageOutputFormat::Png)
            .expect("Could not encode overview as PNG!");
        Self {
            overview_image,
            tile_images,
            raw_overview,
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
        raw_tile.as_mut_rgba8().unwrap().put_pixel(x, y, rgba);
        let (ovw_x, ovw_y) = get_tile_offset(tile_idx);
        replace(&mut self.raw_overview, raw_tile, ovw_x, ovw_y);

        let mut bytes: Vec<u8> = Vec::new();
        raw_tile
            .write_to(&mut bytes, image::ImageOutputFormat::Png)
            .expect("Could not encode tile as PNG!");
        *self
            .tile_images
            .get_mut(tile_idx)
            .expect("Invalid tile index.") = bytes;

        let mut bytes: Vec<u8> = Vec::new();
        self.raw_overview
            .write_to(&mut bytes, image::ImageOutputFormat::Png)
            .expect("Could not encode overview image as PNG!");
        self.overview_image = bytes;
    }
}

impl Default for CanvasState {
    fn default() -> Self {
        Self::new()
    }
}

fn get_tile_offset(tile_idx: usize) -> (u32, u32) {
    let x = (tile_idx as u32 % ROW_LENGTH) * OVERVIEW_TILE_SIZE;
    let y = (tile_idx as u32 / ROW_LENGTH) * OVERVIEW_TILE_SIZE;
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
        if self.start.is_some() {
            Err("already started")
        } else {
            self.start = Some(ic_cdk::api::time());
            Ok(())
        }
    }
}

#[cfg(test)]
mod tests {
    use image::{GenericImageView, Pixel};

    use super::*;
    use std::{io::Cursor, ops::Add, str::FromStr};

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

    #[test]
    fn update_pixel_changes_tile() {
        let mut canvas_state = CanvasState::default();

        let x = (ROW_LENGTH - 1) * TILE_SIZE + 1;
        let y = x;
        let rel_x = x % TILE_SIZE;
        let rel_y = y % TILE_SIZE;
        let col = x / TILE_SIZE;
        let row = y / TILE_SIZE;
        let tile_idx = row * ROW_LENGTH + col;

        let skipped = canvas_state.tile_images.iter().skip(1);
        let mut pairs = canvas_state.tile_images.iter().zip(skipped);
        assert!(pairs.all(|(a, b)| a == b));

        let first_tile = canvas_state.tile_images.first().unwrap().clone();

        let pos = Position { x: rel_x, y: rel_y };
        let color = Color {
            r: 255,
            g: 255,
            b: 255,
            a: 255,
        };
        canvas_state.update_pixel(tile_idx, pos, color);

        let idx = canvas_state
            .tile_images
            .iter()
            .enumerate()
            .find(|(_, tile)| !(*tile).eq(&first_tile))
            .map(|x| x.0)
            .unwrap();
        assert_eq!(idx as u32, tile_idx);

        let tile = canvas_state.tile_images.get(idx).unwrap();
        let img2 = image::io::Reader::new(Cursor::new(tile))
            .with_guessed_format()
            .unwrap();
        let img2 = img2.decode().unwrap();

        let actual_pixel = img2.get_pixel(rel_x, rel_y).to_rgba();
        let actual_pixel = actual_pixel.channels();
        let expected_pixel = &[255, 255, 255, 255];
        assert_eq!(actual_pixel, expected_pixel);

        let ovw_x = col * OVERVIEW_TILE_SIZE;
        let ovw_y = row * OVERVIEW_TILE_SIZE;

        let ovw_image = canvas_state.overview_image;

        let img2 = image::io::Reader::new(Cursor::new(ovw_image))
            .with_guessed_format()
            .unwrap();
        let img2 = img2.decode().unwrap();

        let actual_pixel = img2.get_pixel(ovw_x, ovw_y).to_rgba();
        let actual_pixel = actual_pixel.channels();
        let expected_pixel = &[43, 43, 43, 43];
        assert_eq!(actual_pixel, expected_pixel);
    }
}
