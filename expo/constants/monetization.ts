import { Platform } from "react-native";

/**
 * Banner unit IDs below are **production** AdMob units (not Google TestIds).
 * `EXPO_PUBLIC_ADMOB_IOS_APP_ID` in `app.config.ts` must be the AdMob **App ID**
 * for the same iOS app registration, or requests may be treated as test/invalid.
 */

/** Must match the non-consumable product in App Store Connect and Google Play Console. */
export const REMOVE_ADS_PRODUCT_ID = "com.christianappempire.proverbs31pro.removeads";

export const REMOVE_ADS_PRODUCT_IDS = [REMOVE_ADS_PRODUCT_ID] as const;

export const ADS_ENTITLEMENT_STORAGE_KEY = "@proverbs31pro/remove_ads_entitlement";

/** Production banner ad units (AdMob). */
export const ADMOB_BANNER_UNIT_IOS =
  "ca-app-pub-3002325591150738/1800658805";

export const ADMOB_BANNER_UNIT_ANDROID =
  "ca-app-pub-3002325591150738/6346165202";

export function getBannerAdUnitId(): string {
  return Platform.OS === "ios"
    ? ADMOB_BANNER_UNIT_IOS
    : ADMOB_BANNER_UNIT_ANDROID;
}
