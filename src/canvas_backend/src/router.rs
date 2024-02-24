use std::collections::HashMap;

use pluto::{
    http::{HttpRequest, HttpResponse},
    router::Router,
};
use serde_json::json;

use crate::state::CanvasState;

pub(crate) fn setup() -> Router {
    let mut router = Router::new();

    router.get("/", false, |_req: HttpRequest| async move {
        Ok(HttpResponse {
            status_code: 200,
            headers: HashMap::new(),
            body: json!({
                "statusCode": 200,
                "message": "Hello World from GET",
            })
            .into(),
        })
    });

    router.get(
        "/tile/:value",
        false,
        |_req: HttpRequest| async move {
            let canvas = CanvasState::new();
            // /tile.<tile_idx>.png
            // parse the tile index from the request url
            let tile_idx = _req.params.get("value").unwrap().parse::<u32>().unwrap();

            let tile_body = canvas.fetch_tile(tile_idx);


            Ok(HttpResponse {
                status_code: 200,
                headers: HashMap::new(),
                body: pluto::http::HttpBody::Raw(tile_body)
            })
        },
    );

    router.get("/overview.png", false, |_req: HttpRequest| async move {
        let canvas = CanvasState::new();
        let overview_png = canvas.overview_image.clone();
        let headers = png_header_fields(&overview_png);

        Ok(HttpResponse {
            status_code: 200,
            headers,
            body: pluto::http::HttpBody::Raw(overview_png),
        })
    });

    router
}

pub fn png_header_fields(body: &[u8]) -> HashMap<String, String> {
    let mut headers = HashMap::new();

    headers.insert("Content-Type".to_string(), "image/png".to_string());
    headers.insert("Content-Length".to_string(), body.len().to_string());

    headers
}
