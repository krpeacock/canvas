#!/bin/bash

cargo build --target wasm32-unknown-unknown --package canvas_backend --release
ic-cdk-optimizer target/wasm32-unknown-unknown/release/canvas_backend.wasm -o target/wasm32-unknown-unknown/release/canvas_backend-opt.wasm
