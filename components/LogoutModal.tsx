import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../lib/auth-context";

type LogoutModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function LogoutModal({ visible, onClose }: LogoutModalProps) {
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View style={styles.iconCircle}>
            <Ionicons color="#111827" name="log-out-outline" size={30} />
          </View>
          <Text style={styles.title}>Log out?</Text>
          <Text style={styles.message}>Are you sure you want to log out of J-Hopping?</Text>
          <View style={styles.actions}>
            <Pressable disabled={isLoggingOut} onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={isLoggingOut}
              onPress={handleLogout}
              style={[styles.logoutButton, isLoggingOut && styles.disabledButton]}
            >
              {isLoggingOut ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.logoutText}>Logout</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  modal: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.24)",
    maxWidth: 380,
    padding: 24,
    width: "100%",
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: "#f2f4f7",
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    marginBottom: 14,
    width: 60,
  },
  title: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
  },
  message: {
    color: "#475467",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
    width: "100%",
  },
  cancelButton: {
    alignItems: "center",
    borderColor: "#111827",
    borderRadius: 8,
    borderWidth: 1.3,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  cancelText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: "#dc2626",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.72,
  },
});
