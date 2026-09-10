import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { ManagerLayout } from "../../components/manager/ManagerLayout";
import { useAuth } from "../../lib/auth-context";

export default function ManagerBusiness() {
  const { user } = useAuth();

  return (
    <ManagerLayout subtitle="Your destination manager business details." title="Business details">
      <View style={styles.card}>
        <Ionicons color="#0B4F6C" name="business-outline" size={34} />
        <Text style={styles.title}>{user?.businessName || "Business profile"}</Text>
        <Text style={styles.message}>Business editing will be available here.</Text>
      </View>
    </ManagerLayout>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 8, padding: 28 },
  title: { color: "#1A1A1A", fontSize: 20, fontWeight: "700", marginTop: 14, textAlign: "center" },
  message: { color: "#667085", fontSize: 14, marginTop: 8, textAlign: "center" },
});
