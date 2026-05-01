import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIAP, type Purchase } from "expo-iap";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import {
  LEGACY_REMOVE_ADS_ENTITLEMENT_KEY,
  PRO_ENTITLEMENT_STORAGE_KEY,
  PRO_UPGRADE_PRODUCT_ID,
  PRO_UPGRADE_PRODUCT_IDS,
} from "@/constants/monetization";
import { MonetizationContext } from "@/providers/MonetizationContext";

async function setProEntitlement(enabled: boolean) {
  if (enabled) {
    await AsyncStorage.setItem(PRO_ENTITLEMENT_STORAGE_KEY, "1");
    await AsyncStorage.removeItem(LEGACY_REMOVE_ADS_ENTITLEMENT_KEY);
  } else {
    await AsyncStorage.removeItem(PRO_ENTITLEMENT_STORAGE_KEY);
  }
}

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
  const [purchaseBusy, setPurchaseBusy] = useState(false);
  const entitlementLoaded = useRef(false);

  const applyPurchaseIfPro = useCallback(async (purchase: Purchase) => {
    if (purchase.productId !== PRO_UPGRADE_PRODUCT_ID) return;
    await setProEntitlement(true);
    setIsPro(true);
  }, []);

  const {
    connected,
    products,
    availablePurchases,
    finishTransaction,
    fetchProducts,
    requestPurchase,
    getAvailablePurchases,
    restorePurchases: iapRestorePurchases,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      await applyPurchaseIfPro(purchase);
      try {
        await finishTransaction({ purchase, isConsumable: false });
      } catch {
        /* already finished or store edge case */
      }
    },
    onPurchaseError: () => {},
    onError: () => {},
  });

  useEffect(() => {
    void (async () => {
      try {
        if (await readProEntitlement()) setIsPro(true);
      } finally {
        entitlementLoaded.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    if (!connected) return;
    void (async () => {
      try {
        await fetchProducts({
          skus: [...PRO_UPGRADE_PRODUCT_IDS],
          type: "in-app",
        });
      } catch {
        /* offline / store unavailable */
      }
    })();
  }, [connected, fetchProducts]);

  useEffect(() => {
    if (!connected || !entitlementLoaded.current || isPro) return;
    void (async () => {
      try {
        await getAvailablePurchases();
      } catch {
        /* ignore */
      }
    })();
  }, [connected, isPro, getAvailablePurchases]);

  useEffect(() => {
    if (isPro) return;
    const owned = availablePurchases.some(
      (p) => p.productId === PRO_UPGRADE_PRODUCT_ID,
    );
    if (owned) {
      void setProEntitlement(true);
      setIsPro(true);
    }
  }, [availablePurchases, isPro]);

  const proProduct =
    products.find((p) => p.id === PRO_UPGRADE_PRODUCT_ID) ?? null;

  const purchaseProUpgrade = useCallback(async () => {
    if (purchaseBusy) return;
    setPurchaseBusy(true);
    try {
      if (Platform.OS === "ios") {
        await requestPurchase({
          type: "in-app",
          request: {
            apple: { sku: PRO_UPGRADE_PRODUCT_ID },
          },
        });
      } else {
        await requestPurchase({
          type: "in-app",
          request: {
            google: { skus: [PRO_UPGRADE_PRODUCT_ID] },
          },
        });
      }
    } catch {
      /* user cancelled or transient error */
    } finally {
      setPurchaseBusy(false);
    }
  }, [purchaseBusy, requestPurchase]);

  const restorePurchases = useCallback(async () => {
    try {
      await iapRestorePurchases();
      await getAvailablePurchases();
    } catch {
      Alert.alert(
        "Restore failed",
        "We could not reach the store. Check your connection and try again.",
      );
    }
  }, [iapRestorePurchases, getAvailablePurchases]);

  const value = useMemo(
    () => ({
      isPro,
      proProduct,
      purchaseBusy,
      purchaseProUpgrade,
      restorePurchases,
    }),
    [isPro, proProduct, purchaseBusy, purchaseProUpgrade, restorePurchases],
  );

  return (
    <MonetizationContext.Provider value={value}>
      {children}
    </MonetizationContext.Provider>
  );
}
