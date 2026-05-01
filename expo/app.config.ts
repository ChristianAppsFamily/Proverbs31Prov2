import type { ExpoConfig } from "expo/config";

const trackingMessage =
  "This allows us to show you more relevant ads and support the app. You can change this anytime in iOS Settings.";

/**
 * Production ads require your real AdMob **App ID** (the `ca-app-pub-…~…` value).
 * Google's sample app IDs must not be baked in, or AdMob treats traffic as test
 * when paired with your real banner unit IDs.
 */
function resolveAdMobIosAppId(): string {
  const fromEnv = process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.EXPO_PUBLIC_ADMOB_ALLOW_SAMPLE_IOS_APP_ID === "1") {
    return "ca-app-pub-3940256099942544~1458002511";
  }
  throw new Error(
    "[app.config] Set EXPO_PUBLIC_ADMOB_IOS_APP_ID in expo/.env to your AdMob iOS App ID (AdMob → Apps → your app → App settings). " +
      "This must match the app that owns banner unit ca-app-pub-3002325591150738/1800658805. " +
      "For emergency use of Google sample app ID only, set EXPO_PUBLIC_ADMOB_ALLOW_SAMPLE_IOS_APP_ID=1 (test ads).",
  );
}

function resolveAdMobAndroidAppId(): string {
  const fromEnv = process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID?.trim();
  if (fromEnv) return fromEnv;
  return "ca-app-pub-3940256099942544~3347511713";
}

const admobIosAppId = resolveAdMobIosAppId();
const admobAndroidAppId = resolveAdMobAndroidAppId();

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
    [
      "expo-router",
      {
        origin: "https://rork.com/",
      },
    ],
    "expo-font",
    "expo-web-browser",
    "expo-apple-authentication",
    [
      "expo-tracking-transparency",
      {
        userTrackingPermission: trackingMessage,
      },
    ],
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: admobAndroidAppId,
        iosAppId: admobIosAppId,
        userTrackingUsageDescription: trackingMessage,
      },
    ],
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
