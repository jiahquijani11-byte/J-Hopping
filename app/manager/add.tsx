import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { ManagerLayout } from "../../components/manager/ManagerLayout";

export default function ManagerAdd() {
  return (
    <ManagerLayout subtitle="Create a new destination listing." title="Add">
      <View style={styles.card}>
        <Ionicons color="#0B4F6C" name="add-circle-outline" size={34} />
        <Text style={styles.title}>Add a destination</Text>
        <Text style={styles.message}>Destination creation will be available here.</Text>
      </View>
    </ManagerLayout>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, padding: 28 },
  title: { color: "#111827", fontSize: 18, fontWeight: "700", marginTop: 12 },
  message: { color: "#667085", fontSize: 14, marginTop: 6, textAlign: "center" },
});
