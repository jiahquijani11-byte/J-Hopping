import { Stack } from "expo-router";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "../lib/auth-context";

function RootNavigator() {
  const { status, user } = useAuth();

  if (status === "loading") {
    return (
      <View style={styles.loadingContainer}>
        <Image source={require("../assets/images/icon.png")} style={styles.loadingLogo} />
        <ActivityIndicator color="#ffffff" size="large" />
      </View>
    );
  }

  const isLoggedIn = status === "authenticated";
  const isAdmin = user?.role === "admin";

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn && isAdmin}>
        <Stack.Screen name="admin" />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn && !isAdmin}>
        <Stack.Screen name="user" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    backgroundColor: "#111827",
    flex: 1,
    justifyContent: "center",
  },
  loadingLogo: {
    height: 120,
    marginBottom: 24,
    resizeMode: "contain",
    width: 120,
  },
});
