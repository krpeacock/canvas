use crate::api::{
    Color, Position, NO_TILES, OVERVIEW_IMAGE_SIZE, OVERVIEW_TILE_SIZE, ROW_LENGTH, TILE_SIZE,
};
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
