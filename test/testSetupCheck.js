// /tests/testSetupCheck.js

import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("✅ Node Version:", process.version);

try {
  const pkg = await import(resolve(__dirname, "../package.json"), {
    assert: { type: "json" },
  });

  if (pkg.type !== "module") {
    console.error('❌ "type" in package.json is not set to "module"');
  } else {
    console.log('✅ package.json "type" is correctly set to "module"');
  }
} catch (error) {
  console.error("❌ Error reading package.json:", error.message);
}

try {
  const jestConfig = await import(resolve(__dirname, "../jest.config.js"));
  console.log("✅ jest.config.js loaded successfully");
} catch (error) {
  console.error("❌ Problem with jest.config.js:", error.message);
}

console.log("✅ Test Setup Check Complete!");
