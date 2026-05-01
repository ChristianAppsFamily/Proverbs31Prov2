import AsyncStorage from "@react-native-async-storage/async-storage";
import * as TrackingTransparency from "expo-tracking-transparency";
import { useIAP, type Purchase } from "expo-iap";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import mobileAds from "react-native-google-mobile-ads";
import {
  ADS_ENTITLEMENT_STORAGE_KEY,
  REMOVE_ADS_PRODUCT_ID,
  REMOVE_ADS_PRODUCT_IDS,
} from "@/constants/monetization";
import { MonetizationContext } from "@/providers/MonetizationContext";

async function setEntitlementFlag(enabled: boolean) {
  if (enabled) {
    await AsyncStorage.setItem(ADS_ENTITLEMENT_STORAGE_KEY, "1");
  } else {
    await AsyncStorage.removeItem(ADS_ENTITLEMENT_STORAGE_KEY);
  }
}

export function MonetizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [adsRemoved, setAdsRemoved] = useState(false);
  const [adsSdkReady, setAdsSdkReady] = useState(false);
  const [purchaseBusy, setPurchaseBusy] = useState(false);
  const entitlementLoaded = useRef(false);

  const applyPurchaseIfRemoveAds = useCallback(async (purchase: Purchase) => {
    if (purchase.productId !== REMOVE_ADS_PRODUCT_ID) return;
    await setEntitlementFlag(true);
    setAdsRemoved(true);
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
      await applyPurchaseIfRemoveAds(purchase);
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
        const v = await AsyncStorage.getItem(ADS_ENTITLEMENT_STORAGE_KEY);
        if (v === "1") setAdsRemoved(true);
      } finally {
        entitlementLoaded.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (Platform.OS === "ios") {
          await TrackingTransparency.requestTrackingPermissionsAsync();
        }
        await mobileAds().initialize();
        if (!cancelled) setAdsSdkReady(true);
      } catch {
        if (!cancelled) setAdsSdkReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!connected) return;
    void (async () => {
      try {
        await fetchProducts({
          skus: [...REMOVE_ADS_PRODUCT_IDS],
          type: "in-app",
        });
      } catch {
        /* offline / store unavailable */
      }
    })();
  }, [connected, fetchProducts]);

  useEffect(() => {
    if (!connected || !entitlementLoaded.current || adsRemoved) return;
    void (async () => {
      try {
        await getAvailablePurchases();
      } catch {
        /* ignore */
      }
    })();
  }, [connected, adsRemoved, getAvailablePurchases]);

  useEffect(() => {
    if (adsRemoved) return;
    const owned = availablePurchases.some(
      (p) => p.productId === REMOVE_ADS_PRODUCT_ID,
    );
    if (owned) {
      void setEntitlementFlag(true);
      setAdsRemoved(true);
    }
  }, [availablePurchases, adsRemoved]);

  const removeAdsProduct =
    products.find((p) => p.id === REMOVE_ADS_PRODUCT_ID) ?? null;

  const purchaseRemoveAds = useCallback(async () => {
    if (purchaseBusy) return;
    setPurchaseBusy(true);
    try {
      if (Platform.OS === "ios") {
        await requestPurchase({
          type: "in-app",
          request: {
            apple: { sku: REMOVE_ADS_PRODUCT_ID },
          },
        });
      } else {
        await requestPurchase({
          type: "in-app",
          request: {
            google: { skus: [REMOVE_ADS_PRODUCT_ID] },
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
      adsRemoved,
      adsSdkReady,
      removeAdsProduct,
      purchaseBusy,
      purchaseRemoveAds,
      restorePurchases,
    }),
    [
      adsRemoved,
      adsSdkReady,
      removeAdsProduct,
      purchaseBusy,
      purchaseRemoveAds,
      restorePurchases,
    ],
  );

  return (
    <MonetizationContext.Provider value={value}>
      {children}
    </MonetizationContext.Provider>
  );
}
