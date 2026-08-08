import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginUser } from "../lib/api";
import { useAuth } from "../lib/auth-context";

const ADMIN_USERNAME = "jiahadmin";
const ADMIN_PASSWORD = "admin123";

export default function Login() {
  const { height, width } = useWindowDimensions();
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleLogin = async () => {
    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      setError("Enter your username and password.");
      return;
    }

    setError("");
    setIsSigningIn(true);

    try {
      if (cleanUsername === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        await signIn({
          id: 0,
          firstName: "Admin",
          lastName: null,
          email: "admin@jhopping.com",
          username: ADMIN_USERNAME,
          role: "admin",
        });
        setPassword("");
        return;
      }

      const result = await loginUser({ identifier: cleanUsername, password });
      await signIn(result.data);
      setPassword("");
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Unable to sign in right now.",
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/corousel12.png")}
        resizeMode="cover"
        style={[styles.background, { height, width }]}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.heroText}>
                <Text style={styles.title}>Hop In</Text>
                <Text style={styles.subtitle}>Login to continue with J-Hopping.</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Login</Text>
                <Text style={styles.sectionHint}>
                  Start your next adventure here!
                </Text>

                <TextInput
                  autoCapitalize="none"
                  onChangeText={setUsername}
                  placeholder="Username"
                  placeholderTextColor="#8a94a6"
                  style={styles.input}
                  value={username}
                />
                <View style={styles.passwordField}>
                  <TextInput
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#8a94a6"
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                    value={password}
                  />
                  <Pressable
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    onPress={() => setShowPassword((current) => !current)}
                    style={styles.iconButton}
                  >
                    <Ionicons
                      color="#111827"
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={21}
                    />
                  </Pressable>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Pressable
                  disabled={isSigningIn}
                  onPress={handleLogin}
                  style={[styles.button, isSigningIn && styles.disabledButton]}
                >
                  {isSigningIn ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Sign in</Text>
                  )}
                </Pressable>

                <Pressable onPress={() => router.push("/signup")} style={styles.signupLink}>
                  <Text style={styles.signupText}>
                    Don&apos;t have an account? <Text style={styles.signupStrong}>Sign up</Text>
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>

      <Modal transparent visible={isSigningIn} animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#111827" />
            <Text style={styles.loadingText}>Signing in...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11, 18, 32, 0.5)",
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  heroText: {
    maxWidth: 520,
    width: "100%",
  },
  title: {
    color: "#ffffff",
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 48,
  },
  subtitle: {
    color: "#eef2ff",
    fontSize: 17,
    lineHeight: 25,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.24)",
    gap: 12,
    marginTop: 18,
    maxWidth: 520,
    padding: 18,
    width: "100%",
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },
  sectionHint: {
    color: "#475467",
    fontSize: 13,
    lineHeight: 19,
    marginTop: -6,
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#d0d5dd",
    borderRadius: 8,
    borderWidth: 1.3,
    color: "#111827",
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  passwordField: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d0d5dd",
    borderRadius: 8,
    borderWidth: 1.3,
    flexDirection: "row",
    minHeight: 48,
  },
  passwordInput: {
    color: "#111827",
    flex: 1,
    fontSize: 15,
    minHeight: 46,
    paddingLeft: 14,
    paddingRight: 8,
  },
  iconButton: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 50,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.72,
  },
  signupLink: {
    alignItems: "center",
    marginTop: 4,
  },
  signupText: {
    color: "#475467",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  signupStrong: {
    color: "#111827",
    fontWeight: "800",
  },
  loadingOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    flex: 1,
    justifyContent: "center",
  },
  loadingBox: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    gap: 12,
    minWidth: 180,
    padding: 20,
  },
  loadingText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
  },
});
