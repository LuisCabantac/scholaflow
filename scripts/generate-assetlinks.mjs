import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readFingerprintFromEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    const match = fs
      .readFileSync(file, "utf8")
      .match(/^SHA256_FINGERPRINT=(.+)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, "");
  }
  return undefined;
}

const fingerprint =
  process.env.SHA256_FINGERPRINT || readFingerprintFromEnvFiles();

if (!fingerprint) {
  console.warn(
    "SHA256_FINGERPRINT not set; skipping public/.well-known/assetlinks.json",
  );
  process.exit(0);
}

const assetlinks = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.luiscabantac.scholaflow",
      sha256_cert_fingerprints: [fingerprint],
    },
  },
];

const dir = path.join(root, "public", ".well-known");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(
  path.join(dir, "assetlinks.json"),
  `${JSON.stringify(assetlinks, null, 2)}\n`,
);
