import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LogoutModal } from "../../components/LogoutModal";
import { ManagerLayout } from "../../components/manager/ManagerLayout";
import { useAuth } from "../../lib/auth-context";

export default function ManagerSettings() {
  const { user } = useAuth();
  const [logoutVisible, setLogoutVisible] = useState(false);

  return (
    <ManagerLayout scrollable subtitle="Manage your destination business." title="Settings">
      <SettingsSection title="Business">
        <SettingsRow
          icon="business-outline"
          meta={user?.businessName || "Manage your destination manager business"}
          onPress={() => router.push("/manager/business")}
          title="Business details"
        />
      </SettingsSection>

      <SettingsSection title="Insights">
        <SettingsRow
          icon="bar-chart-outline"
          meta="View business activity and reports"
          onPress={() => router.push("/manager/reports")}
          title="Reports"
        />
      </SettingsSection>

      <SettingsSection title="System">
        <View style={styles.systemRow}>
          <Text style={styles.rowMeta}>App version</Text>
          <Text style={styles.systemValue}>1.0.0</Text>
        </View>
        <View style={styles.rule} />
        <View style={styles.systemRow}>
          <Text style={styles.rowMeta}>API endpoint</Text>
          <Text style={styles.systemValue}>/api</Text>
        </View>
      </SettingsSection>

      <Pressable accessibilityRole="button" onPress={() => setLogoutVisible(true)} style={styles.logoutButton}>
        <Ionicons color="#FFFFFF" name="log-out-outline" size={19} />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>

      <LogoutModal onClose={() => setLogoutVisible(false)} visible={logoutVisible} />
    </ManagerLayout>
  );
}

type SettingsSectionProps = {
  children: ReactNode;
  title: string;
};

function SettingsSection({ children, title }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionLabel}>
        <View style={styles.dot} />
        <Text style={styles.sectionText}>{title.toUpperCase()}</Text>
      </View>
      <View style={styles.rule} />
      {children}
      <View style={styles.rule} />
    </View>
  );
}

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  meta: string;
  onPress: () => void;
  title: string;
};

function SettingsRow({ icon, meta, onPress, title }: SettingsRowProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <Ionicons color="#1A1A1A" name={icon} size={20} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text numberOfLines={1} style={styles.rowMeta}>{meta}</Text>
      </View>
      <Ionicons color="#666666" name="chevron-forward" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  sectionLabel: { alignItems: "center", flexDirection: "row", gap: 8, marginBottom: 10 },
  dot: { backgroundColor: "#4A9FD8", borderRadius: 3, height: 5, width: 5 },
  sectionText: { color: "#666666", fontSize: 11, fontWeight: "600", letterSpacing: 1.4 },
  rule: { backgroundColor: "#EEF0F2", height: 1, width: "100%" },
  row: { alignItems: "center", backgroundColor: "#FFFFFF", flexDirection: "row", gap: 12, paddingVertical: 14 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { color: "#1A1A1A", fontSize: 14, fontWeight: "500" },
  rowMeta: { color: "#666666", fontSize: 12 },
  systemRow: { alignItems: "center", backgroundColor: "#FFFFFF", flexDirection: "row", justifyContent: "space-between", paddingVertical: 13 },
  systemValue: { color: "#1A1A1A", fontSize: 12 },
  logoutButton: { alignItems: "center", backgroundColor: "#C0392B", borderRadius: 4, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 28, minHeight: 50 },
  logoutText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});
