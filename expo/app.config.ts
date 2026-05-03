import type { ExpoConfig } from "expo/config";

const privacyPolicyUrl =
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ??
  "https://christianappsfamily.github.io/Proverbs31Prov2/privacy-policy.html";

export default (): ExpoConfig => ({
  name: "Proverbs 31 Pro",
  slug: "oz9kpuyan1lepsrk6asue",
  version: "1.8.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "com.christianappempire.proverbs31pro",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.christianappempire.proverbs31pro",
    buildNumber: process.env.EXPO_IOS_BUILD_NUMBER ?? "1",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.christianappempire.proverbs31pro",
  },
  web: {
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "./plugins/withIosBuildFixes",
    [
      "expo-router",
      {
        origin: "https://rork.com/",
      },
    ],
    "expo-font",
    "expo-web-browser",
    "expo-apple-authentication",
    "expo-iap",
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "15.1",
        },
        android: {
          kotlinVersion: "2.1.20",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    privacyPolicyUrl,
  },
});
