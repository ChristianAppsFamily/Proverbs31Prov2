import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  Ban,
  Facebook,
  Instagram,
  Mail,
  MoreHorizontal,
  Shield,
  Star,
  Users,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { getPrivacyPolicyUrl } from "@/constants/links";
import { useEngagement } from "@/providers/EngagementProvider";
import { useMonetization } from "@/providers/MonetizationContext";

export default function SettingsScreen() {
  const { notifications, setNotifications } = useEngagement();
  const {
    adsRemoved,
    removeAdsProduct,
    purchaseBusy,
    purchaseRemoveAds,
    restorePurchases,
  } = useMonetization();

  const removeAdsLabel = adsRemoved
    ? "Ads removed — thank you!"
    : `Remove ads${removeAdsProduct?.displayPrice ? ` (${removeAdsProduct.displayPrice})` : " ($4.99)"}`;

  const openLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (e) {
      console.log("[settings] open link error", e);
    }
  };

  const showSoon = (title: string) => {
    Alert.alert(title, "Coming soon.");
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "More Info" }} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>More Info</Text>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Daily Notifications</Text>
              <Text style={styles.rowSubtitle}>
                A gentle reminder to open your daily verse.
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.mist, true: Colors.plum }}
              thumbColor={Platform.OS === "android" ? Colors.white : undefined}
              ios_backgroundColor={Colors.mist}
              testID="notifications-switch"
            />
          </View>
        </View>

        <SectionHeading title="Privacy & purchases" />
        <PrimaryButton
          icon={<Shield size={18} color={Colors.white} />}
          label="Privacy policy"
          onPress={() => openLink(getPrivacyPolicyUrl())}
        />
        <PrimaryButton
          icon={<Ban size={18} color={Colors.white} />}
          label={removeAdsLabel}
          onPress={() => {
            if (adsRemoved) return;
            void purchaseRemoveAds();
          }}
          disabled={adsRemoved || purchaseBusy}
        />
        <Pressable
          onPress={() => void restorePurchases()}
          style={({ pressed }) => [
            styles.restoreLink,
            pressed && { opacity: 0.75 },
          ]}
          testID="btn-restore-purchases"
        >
          <Text style={styles.restoreLinkText}>Restore purchases</Text>
        </Pressable>

        <SectionHeading title="Support Us" />
        <Text style={styles.paragraph}>
          Christian App Empire has been creating faith-based apps since 2014.
          We appreciate your feedback, which helps us continue improving. If
          this app has encouraged you, please consider supporting us by leaving
          a rating, exploring our other apps, and most of all praying for us,
          as we continue on our mission.
        </Text>

        <PrimaryButton
          icon={<Star size={18} color={Colors.white} />}
          label="Rate This App"
          onPress={() => showSoon("Rate This App")}
        />
        <PrimaryButton
          icon={<MoreHorizontal size={18} color={Colors.white} />}
          label="More Apps"
          onPress={() => showSoon("More Apps")}
        />
        <SectionHeading title="About Us" />
        <Text style={styles.paragraph}>
          Christian App Empire, prays that you would be further encouraged, to
          go deeper in your study and your communion with the Lord Jesus.
          Follow us and discover more resources created to support you on your
          faith journey.
        </Text>
        <SecondaryButton
          icon={<Facebook size={18} color={Colors.plum} />}
          label="Facebook Like Us"
          onPress={() => openLink("https://www.facebook.com/")}
        />
        <SecondaryButton
          icon={<Instagram size={18} color={Colors.plum} />}
          label="Follow Us On Instagram"
          onPress={() => openLink("https://www.instagram.com/")}
        />
        <SecondaryButton
          icon={<Users size={18} color={Colors.plum} />}
          label="Join Our Community"
          onPress={() => openLink("https://www.facebook.com/")}
        />
        <SecondaryButton
          icon={<Mail size={18} color={Colors.plum} />}
          label="Contact Us"
          onPress={() => openLink("mailto:hello@christianappempire.com")}
        />

        <View style={styles.credits}>
          <Text style={styles.creditApp}>Proverbs 31</Text>
          <Text style={styles.creditLine}>
            Developed by Christian App Empire LLC
          </Text>
          <Text style={styles.creditLine}>© 2026 All Rights Reserved</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

function PrimaryButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryBtn,
        disabled && { opacity: 0.55 },
        pressed && !disabled && { opacity: 0.92, transform: [{ scale: 0.995 }] },
      ]}
      testID={`btn-${label}`}
    >
      <View style={styles.primaryIcon}>{icon}</View>
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryBtn,
        pressed && { opacity: 0.92, transform: [{ scale: 0.995 }] },
      ]}
      testID={`btn-${label}`}
    >
      <View style={styles.secondaryIcon}>{icon}</View>
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 60 },
  kicker: {
    fontSize: 11,
    letterSpacing: 2.4,
    color: Colors.gold,
    fontWeight: "700",
    fontFamily: Fonts.sans,
  },
  title: {
    marginTop: 6,
    fontFamily: Fonts.serif,
    fontSize: 30,
    color: Colors.ink,
    marginBottom: 18,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#424E4E",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  rowTitle: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    color: Colors.ink,
  },
  rowSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.inkMuted,
    fontFamily: Fonts.sans,
  },
  paragraph: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.inkMuted,
    marginBottom: 16,
  },
  sectionHeading: {
    marginTop: 32,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    color: Colors.ink,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gold,
    opacity: 0.4,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.plum,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    shadowColor: Colors.plumDark,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: Colors.white,
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    shadowColor: "#424E4E",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  secondaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    color: Colors.ink,
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  credits: {
    marginTop: 40,
    alignItems: "center",
    paddingBottom: 12,
  },
  creditApp: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: Colors.ink,
  },
  creditLine: {
    marginTop: 6,
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.inkMuted,
    letterSpacing: 0.3,
  },
  restoreLink: {
    alignSelf: "center",
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  restoreLinkText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.plum,
    textDecorationLine: "underline",
  },
});
