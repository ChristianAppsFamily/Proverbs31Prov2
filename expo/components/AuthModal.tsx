import * as AppleAuthentication from "expo-apple-authentication";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useAuth } from "@/providers/AuthProvider";

type Purpose = "like" | "comment" | "generic";

type Props = {
  visible: boolean;
  onClose: () => void;
  purpose?: Purpose;
  onSuccess?: () => void;
};

const titles: Record<Purpose, string> = {
  like: "Sign in to save this reflection",
  comment: "Join the conversation",
  generic: "Sign in to Proverbs 31",
};

export default function AuthModal({ visible, onClose, purpose = "generic", onSuccess }: Props) {
  const { signInWithGoogle, signInWithApple, isSigningIn } = useAuth();

  const handleGoogle = useCallback(async () => {
    try {
      await signInWithGoogle();
      onSuccess?.();
      onClose();
    } catch {}
  }, [signInWithGoogle, onClose, onSuccess]);

  const handleApple = useCallback(async () => {
    try {
      await signInWithApple();
      onSuccess?.();
      onClose();
    } catch {}
  }, [signInWithApple, onClose, onSuccess]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} testID="auth-backdrop">
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>{titles[purpose]}</Text>
          <Text style={styles.subtitle}>No password needed — just one tap.</Text>

          <Pressable
            onPress={handleGoogle}
            disabled={isSigningIn}
            style={({ pressed }) => [
              styles.googleBtn,
              pressed && { opacity: 0.85 },
              isSigningIn && { opacity: 0.6 },
            ]}
            testID="auth-google"
          >
            {isSigningIn ? (
              <ActivityIndicator color={Colors.ink} />
            ) : (
              <>
                <GoogleGlyph />
                <Text style={styles.googleText}>Continue with Google</Text>
              </>
            )}
          </Pressable>

          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={styles.appleBtn}
              onPress={handleApple}
            />
          )}

          <Pressable onPress={onClose} style={styles.cancel} testID="auth-cancel">
            <Text style={styles.cancelText}>Maybe later</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function GoogleGlyph() {
  return (
    <View style={styles.g}>
      <Text style={styles.gText}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(66, 78, 78, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.mist,
    marginBottom: 18,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    lineHeight: 28,
    color: Colors.ink,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: "center",
    marginBottom: 22,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.mist,
    marginBottom: 12,
  },
  googleText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.ink,
  },
  g: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  gText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "800",
  },
  appleBtn: {
    height: 48,
    marginBottom: 12,
  },
  cancel: {
    marginTop: 6,
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.inkMuted,
    fontWeight: "600",
  },
});
