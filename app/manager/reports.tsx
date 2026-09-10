import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { ManagerLayout } from "../../components/manager/ManagerLayout";

export default function ManagerReports() {
  return (
    <ManagerLayout subtitle="Review your destination business activity." title="Reports">
      <View style={styles.card}>
        <Ionicons color="#0B4F6C" name="bar-chart-outline" size={34} />
        <Text style={styles.title}>Reports coming soon</Text>
        <Text style={styles.message}>Business insights and reports will appear here.</Text>
      </View>
    </ManagerLayout>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 8, padding: 28 },
  title: { color: "#1A1A1A", fontSize: 20, fontWeight: "700", marginTop: 14 },
  message: { color: "#667085", fontSize: 14, marginTop: 8, textAlign: "center" },
});
