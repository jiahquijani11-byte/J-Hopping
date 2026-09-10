import { Ionicons } from "@expo/vector-icons";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../lib/auth-context";

export default function UserHome() {
  const { user } = useAuth();
  const firstName = user?.firstName ?? "there";

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
              <Ionicons color="#111827" name="person-circle" size={44} />
            </View>
            <Text style={styles.title}>User Dashboard</Text>
            <Text style={styles.subtitle}>
              Welcome back, {firstName}! Explore new stops and plan your next trip.
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
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
  subtitle: {
    color: "#475467",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },
});
