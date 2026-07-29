import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminHome() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Signed in using the static admin credential.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f7f9fc",
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#111827",
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 39,
  },
  subtitle: {
    color: "#667085",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
});
