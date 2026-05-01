/**
 * Non-consumable IAP for the Pro experience (same product id as in App Store Connect / Play Console).
 */
export const PRO_UPGRADE_PRODUCT_ID =
  "com.christianappempire.proverbs31pro.removeads";

export const PRO_UPGRADE_PRODUCT_IDS = [PRO_UPGRADE_PRODUCT_ID] as const;

export const PRO_ENTITLEMENT_STORAGE_KEY = "@proverbs31pro/pro_entitlement";

/** Legacy storage key — migrated on first launch if set. */
export const LEGACY_REMOVE_ADS_ENTITLEMENT_KEY =
  "@proverbs31pro/remove_ads_entitlement";
