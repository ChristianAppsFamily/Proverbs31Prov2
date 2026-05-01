import { createContext, useContext } from "react";
import type { Product } from "expo-iap";

export type MonetizationContextValue = {
  adsRemoved: boolean;
  adsSdkReady: boolean;
  removeAdsProduct: Product | null;
  purchaseBusy: boolean;
  purchaseRemoveAds: () => Promise<void>;
  restorePurchases: () => Promise<void>;
};

const MonetizationContext = createContext<MonetizationContextValue | null>(
  null,
);

export function useMonetization(): MonetizationContextValue {
  const v = useContext(MonetizationContext);
  if (!v) {
    throw new Error("useMonetization must be used within MonetizationProvider");
  }
  return v;
}

export { MonetizationContext };
