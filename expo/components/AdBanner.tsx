import React from "react";
import { StyleSheet, View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { getBannerAdUnitId } from "@/constants/monetization";
import { useMonetization } from "@/providers/MonetizationContext";

export function AdBanner() {
  const { adsRemoved, adsSdkReady } = useMonetization();

  if (adsRemoved || !adsSdkReady) {
    return null;
  }

  return (
    <View style={styles.wrap} collapsable={false}>
      <BannerAd
        unitId={getBannerAdUnitId()}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    width: "100%",
    overflow: "hidden",
  },
});
