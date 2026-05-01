import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { ADS_ENTITLEMENT_STORAGE_KEY } from "@/constants/monetization";
import { MonetizationContext } from "@/providers/MonetizationContext";

export function MonetizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [adsRemoved, setAdsRemoved] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const v = await AsyncStorage.getItem(ADS_ENTITLEMENT_STORAGE_KEY);
        setAdsRemoved(v === "1");
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const purchaseRemoveAds = useCallback(async () => {
    Alert.alert(
      "In-app purchases",
      "Remove Ads is available in the iOS and Android apps from the App Store or Google Play.",
    );
  }, []);

  const restorePurchases = useCallback(async () => {}, []);

  const value = useMemo(
    () => ({
      adsRemoved,
      adsSdkReady: true,
      removeAdsProduct: null,
      purchaseBusy: false,
      purchaseRemoveAds,
      restorePurchases,
    }),
    [adsRemoved, purchaseRemoveAds, restorePurchases],
  );

  return (
    <MonetizationContext.Provider value={value}>
      {children}
    </MonetizationContext.Provider>
  );
}
