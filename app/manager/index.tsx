import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { ManagerLayout } from "../../components/manager/ManagerLayout";

export default function ManagerHome() {
  return (
    <ManagerLayout title="Manager Home" subtitle="Manage your destination business from here.">
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons color="#0B4F6C" name="business-outline" size={32} />
        </View>
        <Text style={styles.title}>Welcome to your workspace</Text>
        <Text style={styles.message}>
          Your destination manager tools will appear here as they become available.
        </Text>
      </View>
    </ManagerLayout>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 8, padding: 26 },
  iconCircle: { alignItems: "center", backgroundColor: "#E8F3F8", borderRadius: 32, height: 64, justifyContent: "center", width: 64 },
  title: { color: "#1A1A1A", fontSize: 20, fontWeight: "700", marginTop: 16, textAlign: "center" },
  message: { color: "#667085", fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: "center" },
});
