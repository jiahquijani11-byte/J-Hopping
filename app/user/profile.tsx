import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogoutModal } from "../../components/LogoutModal";
import { useAuth } from "../../lib/auth-context";

export default function UserProfile() {
  const { user } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "J-Hopping User";

  return (
    <View style={styles.container}>
      <ImageBackground
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
        source={require("../../assets/images/corousel12.png")}
        style={styles.background}
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.content}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons color="#111827" name="person" size={40} />
            </View>
            <Text style={styles.title}>{fullName}</Text>

            <View style={styles.infoRow}>
              <Ionicons color="#667085" name="at-outline" size={18} />
              <Text style={styles.infoText}>{user?.username}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons color="#667085" name="mail-outline" size={18} />
              <Text style={styles.infoText}>{user?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons color="#667085" name="shield-checkmark-outline" size={18} />
              <Text style={styles.infoText}>
                {user?.role === "admin" ? "Administrator" : "Member"}
              </Text>
            </View>

            <Pressable onPress={() => setShowLogout(true)} style={styles.logoutButton}>
              <Ionicons color="#ffffff" name="log-out-outline" size={20} />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <LogoutModal visible={showLogout} onClose={() => setShowLogout(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111827",
    flex: 1,
  },
  background: {
    backgroundColor: "#111827",
    flex: 1,
  },
  backgroundImage: {
    backgroundColor: "#111827",
    height: "100%",
    width: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(11, 18, 32, 0.48)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  card: {
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.24)",
    maxWidth: 420,
    padding: 26,
    width: "100%",
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: "#f2f4f7",
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    marginBottom: 14,
    width: 68,
  },
  title: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
    textAlign: "center",
  },
  infoRow: {
    alignItems: "center",
    alignSelf: "stretch",
    borderColor: "#e4e7ec",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 46,
    paddingHorizontal: 4,
  },
  infoText: {
    color: "#111827",
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: "#dc2626",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 22,
    minHeight: 50,
    width: "100%",
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
});
