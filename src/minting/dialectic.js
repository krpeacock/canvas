import { Blob } from "buffer";
global.Blob = Blob;
import { AssetManager } from "@slide-computer/assets";
import { fileURLToPath } from "url";
import { HttpAgent } from "@dfinity/agent";
import fetch from "isomorphic-fetch";
import fs from "fs";
import imageThumbnail from "image-thumbnail";
import mmm from "mmmagic";
import { createRequire } from "node:module";
import path from "path";
import prettier from "prettier";
import sha256File from "sha256-file";

// import { canisterId, createActor } from "../declarations/dialectic_nft/index";
import {
  canisterId,
  createActor,
} from "../declarations/dialectic_nft/index.js";
import { identity } from "./identity.js";

const require = createRequire(import.meta.url);
const localCanisterIds = require("../../.dfx/local/canister_ids.json");
const nftConfig = require("./nfts.json");
const encoder = new TextEncoder();

const agent = new HttpAgent({
  identity: await identity,
  host: "http://127.0.0.1:8000",
  fetch,
});
const effectiveCanisterId =
  canisterId?.toString() ?? localCanisterIds.dialectic_nft.local;
const assetCanisterId = localCanisterIds.canvas_assets.local;
const actor = createActor(effectiveCanisterId, {
  agent,
});
const assetManager = new AssetManager({
  canisterId: assetCanisterId,
  agent,
  concurrency: 32, // Optional (default: 32), max concurrent requests.
  maxSingleFileSize: 450000, // Optional bytes (default: 450000), larger files will be uploaded as chunks.
  maxChunkSize: 1900000, // Optional bytes (default: 1900000), size of chunks when file is uploaded as chunks.
});

nftConfig.reduce(async (prev, nft, idx) => {
  if (!nft.asset) return;
  await prev;
  console.log("starting upload for " + nft.asset);

  // Parse metadata, if present
  const metadata = Object.entries(nft.metadata ?? []).map(([key, value]) => {
    return [key, { TextContent: value }];
  });

  const filePath = path.join(
    fileURLToPath(import.meta.url),
    "..",
    "assets",
    nft.asset
  );

  const file = fs.readFileSync(filePath);

  const sha = sha256File(filePath);
  const options = {
    width: 256,
    height: 256,
    jpegOptions: { force: true, quality: 90 },
  };
  console.log("generating thumbnail");
  const thumbnail = await imageThumbnail(filePath, options);

  const magic = await new mmm.Magic(mmm.MAGIC_MIME_TYPE);
  const contentType = await new Promise((resolve, reject) => {
    magic.detectFile(filePath, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
  console.log("detected contenttype of ", contentType);

  /**
   * For asset in nfts.json
   *
   * Take asset
   * Check extenstion / mimetype
   * Sha content
   * Generate thumbnail
   * Upload both to asset canister -> file paths
   * Generate metadata from key / value
   * Mint ^
   */

  const uploadedFilePath = `token/${nft.metadata["title"]}${path.extname(
    nft.asset
  )}`;
  const uploadedThumbnailPath = `thumbnail/${nft.metadata["title"]}.jpeg`;

  console.log("uploading asset to ", uploadedFilePath);
  await assetManager.insert(file, { fileName: uploadedFilePath });
  console.log("uploading thumbnail to ", uploadedThumbnailPath);
  await assetManager.insert(thumbnail, { fileName: uploadedThumbnailPath });

  const principal = await (await identity).getPrincipal();

  const data = [
    [
      "location",
      {
        TextContent: `http://${assetCanisterId}.localhost:8000/${uploadedFilePath}`,
      },
    ],
    [
      "thumbnail",
      {
        TextContent: `http://${assetCanisterId}.localhost:8000/${uploadedThumbnailPath}`,
      },
    ],
    ["contentType", { TextContent: contentType }],
    ["contentHash", { BlobContent: [...encoder.encode(sha)] }],
    ...metadata,
  ];
  const mintResult = await actor.mint(principal, BigInt(idx), data);
  console.log("result: ", mintResult);
  const metaResult = await actor.tokenMetadata(BigInt(idx));
  console.log(
    "token metadata: ",
    prettier.format(
      JSON.stringify(metaResult, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      ),
      { parser: "json" }
    )
  );
});
