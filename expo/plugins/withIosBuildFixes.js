const { withDangerousMod } = require("expo/config-plugins");

/** Corrupted template merged swift + inherited into one invalid quoted string. */
const BAD_LIBRARY_SEARCH_PATHS =
  'LIBRARY_SEARCH_PATHS = "$(SDKROOT)/usr/lib/swift\\"$(inherited)\\"";';
const GOOD_LIBRARY_SEARCH_PATHS =
  'LIBRARY_SEARCH_PATHS = "$(SDKROOT)/usr/lib/swift" "$(inherited)";';

/**
 * Fixes iOS Xcode settings that break Swift / CocoaPods module map resolution.
 * Runs after native project files are written (e.g. `expo prebuild`).
 */
function withIosBuildFixes(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const fs = require("fs");
      const path = require("path");
      const iosRoot = config.modRequest.platformProjectRoot;

      for (const ent of fs.readdirSync(iosRoot, { withFileTypes: true })) {
        if (!ent.isDirectory() || !ent.name.endsWith(".xcodeproj")) continue;
        const pbxPath = path.join(iosRoot, ent.name, "project.pbxproj");
        if (!fs.existsSync(pbxPath)) continue;
        let body = fs.readFileSync(pbxPath, "utf8");
        if (body.includes(BAD_LIBRARY_SEARCH_PATHS)) {
          body = body.split(BAD_LIBRARY_SEARCH_PATHS).join(GOOD_LIBRARY_SEARCH_PATHS);
          fs.writeFileSync(pbxPath, body);
        }
      }

      return config;
    },
  ]);
}

module.exports = withIosBuildFixes;
