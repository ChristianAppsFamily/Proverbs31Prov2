import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import {
  LEGACY_REMOVE_ADS_ENTITLEMENT_KEY,
  PRO_ENTITLEMENT_STORAGE_KEY,
} from "@/constants/monetization";
import { MonetizationContext } from "@/providers/MonetizationContext";

async function readProEntitlement(): Promise<boolean> {
  const pro = await AsyncStorage.getItem(PRO_ENTITLEMENT_STORAGE_KEY);
  if (pro === "1") return true;
  const legacy = await AsyncStorage.getItem(LEGACY_REMOVE_ADS_ENTITLEMENT_KEY);
  if (legacy === "1") {
    await AsyncStorage.setItem(PRO_ENTITLEMENT_STORAGE_KEY, "1");
    await AsyncStorage.removeItem(LEGACY_REMOVE_ADS_ENTITLEMENT_KEY);
    return true;
  }
  return false;
}

export function MonetizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        if (await readProEntitlement()) setIsPro(true);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const purchaseProUpgrade = useCallback(async () => {
    Alert.alert(
      "Upgrade to Pro",
      "In-app purchases are available in the iOS and Android apps from the App Store or Google Play.",
    );
  }, []);

  const restorePurchases = useCallback(async () => {}, []);

  const value = useMemo(
    () => ({
      isPro,
      proProduct: null,
      purchaseBusy: false,
      purchaseProUpgrade,
      restorePurchases,
    }),
    [isPro, purchaseProUpgrade, restorePurchases],
  );

  return (
    <MonetizationContext.Provider value={value}>
      {children}
    </MonetizationContext.Provider>
  );
}
