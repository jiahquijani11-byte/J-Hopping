import { ManagerLayout } from "../../components/manager/ManagerLayout";
import { StyleSheet, Text, View } from "react-native";

export default function ManagerBookings() {
  return (
    <ManagerLayout title="Bookings" subtitle="Review bookings for your destinations.">
      <View style={styles.card}><Text style={styles.title}>Bookings coming soon</Text></View>
    </ManagerLayout>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 8, padding: 28 },
  title: { color: "#1A1A1A", fontSize: 20, fontWeight: "700" },
});
