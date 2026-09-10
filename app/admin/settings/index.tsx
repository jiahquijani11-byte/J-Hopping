import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogoutModal } from "../../../components/LogoutModal";
import { useAuth } from "../../../lib/auth-context";
import { formatProfileName } from "../../../lib/text";

export default function AdminSettings() {
  const { user } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const adminName = formatProfileName(user ?? {}) || user?.username || "Administrator";
  const adminInitials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((part) => part?.[0]?.toUpperCase())
    .join("") || "AD";

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.greetingRow}>
          <View style={styles.avatar}><Text style={styles.initials}>{adminInitials}</Text></View>
          <View style={styles.greetingText}>
            <Text style={styles.hello}>Hello 👋</Text>
            <Text style={styles.adminName}>{adminName}</Text>
          </View>
          <Ionicons color="#FFFFFF" name="notifications-outline" size={22} />
        </View>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>J-Hopping Admin · v1.0.0</Text>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionLabel}>
          <View style={styles.dot} />
          <Text style={styles.sectionText}>ADMINISTRATION</Text>
        </View>
        <View style={styles.rule} />
        <View style={styles.row}>
          <Ionicons color="#1A1A1A" name="person-circle-outline" size={20} />
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Admin profile</Text>
            <Text style={styles.rowMeta}>{user?.username} · {user?.email}</Text>
          </View>
        </View>
        <View style={styles.rule} />
        <Pressable
          onPress={() => router.push("/admin/settings/reports" as Href)}
          style={styles.row}
        >
          <Ionicons color="#1A1A1A" name="bar-chart-outline" size={20} />
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Reports</Text>
            <Text style={styles.rowMeta}>Bookings, activity, and destination reports</Text>
          </View>
          <Ionicons color="#666666" name="chevron-forward" size={18} />
        </Pressable>
        <View style={styles.rule} />

        <View style={[styles.sectionLabel, styles.systemLabel]}>
          <View style={styles.dot} />
          <Text style={styles.sectionText}>SYSTEM</Text>
        </View>
        <View style={styles.rule} />
        <View style={styles.systemRow}>
          <Text style={styles.rowMeta}>App version</Text>
          <Text style={styles.systemValue}>1.0.0 (54)</Text>
        </View>
        <View style={styles.rule} />
        <View style={styles.systemRow}>
          <Text style={styles.rowMeta}>API endpoint</Text>
          <Text style={styles.systemValue}>/api</Text>
        </View>

        <Pressable onPress={() => setShowLogout(true)} style={styles.logoutButton}>
          <Ionicons color="#FFFFFF" name="log-out-outline" size={19} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>

      <LogoutModal visible={showLogout} onClose={() => setShowLogout(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FFFFFF", flex: 1 },
  header: { backgroundColor: "#0B4F6C", paddingBottom: 22, paddingHorizontal: 16 },
  greetingRow: { alignItems: "center", flexDirection: "row", gap: 12, paddingTop: 10 },
  avatar: { alignItems: "center", backgroundColor: "#B3D9F0", borderRadius: 24, height: 42, justifyContent: "center", width: 42 },
  initials: { color: "#1A1A1A", fontSize: 13 },
  greetingText: { flex: 1, gap: 2 },
  hello: { color: "#A9C9DA", fontSize: 12 },
  adminName: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "600", lineHeight: 34, marginTop: 16 },
  subtitle: { color: "#A9C9DA", fontSize: 13, marginTop: 6 },
  content: { paddingBottom: 32, paddingHorizontal: 16, paddingTop: 22 },
  sectionLabel: { alignItems: "center", flexDirection: "row", gap: 8 },
  systemLabel: { marginTop: 26 },
  dot: { backgroundColor: "#4A9FD8", borderRadius: 3, height: 5, width: 5 },
  sectionText: { color: "#666666", fontSize: 11, fontWeight: "600", letterSpacing: 1.4 },
  rule: { backgroundColor: "#EEF0F2", height: 1, width: "100%" },
  row: { alignItems: "center", flexDirection: "row", gap: 12, paddingVertical: 14 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { color: "#1A1A1A", fontSize: 14, fontWeight: "500" },
  rowMeta: { color: "#666666", fontSize: 12 },
  systemRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingVertical: 13 },
  systemValue: { color: "#1A1A1A", fontSize: 12 },
  logoutButton: { alignItems: "center", backgroundColor: "#C0392B", borderRadius: 4, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 28, minHeight: 50 },
  logoutText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});
