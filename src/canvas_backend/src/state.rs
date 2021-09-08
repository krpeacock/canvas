use crate::api::{NO_TILES, OVERVIEW_IMAGE_SIZE, TILE_SIZE};
use image::RgbaImage;

#[derive(Clone, Debug)]
pub struct CanvasState {
    pub overview_image: Vec<u8>,
    pub tile_images: Vec<Vec<u8>>,
    pub raw_overview: RgbaImage,
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
            raw_overview: RgbaImage::new(OVERVIEW_IMAGE_SIZE, OVERVIEW_IMAGE_SIZE),
            raw_tiles,
        }
    }
}
impl Default for CanvasState {
    fn default() -> Self {
        Self::new()
    }
}
