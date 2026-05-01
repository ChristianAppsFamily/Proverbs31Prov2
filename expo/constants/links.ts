import Constants from "expo-constants";

/**
 * Public privacy policy URL (GitHub Pages from /docs).
 * Override at build time with EXPO_PUBLIC_PRIVACY_POLICY_URL if your Pages URL differs.
 */
export function getPrivacyPolicyUrl(): string {
  const fromConfig = Constants.expoConfig?.extra?.privacyPolicyUrl;
  if (typeof fromConfig === "string" && fromConfig.length > 0) {
    return fromConfig;
  }
  return "https://christianappsfamily.github.io/Proverbs31Prov2/privacy-policy.html";
}
