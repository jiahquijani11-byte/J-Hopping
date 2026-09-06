import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AuthLayout } from "../components/AuthLayout";
import { loginUser } from "../lib/api";
import { useAuth } from "../lib/auth-context";

const ADMIN_USERNAME = "jiahadmin";
const ADMIN_PASSWORD = "admin123";

export default function Login() {
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
      <AuthLayout title="J-Hopping" subtitle="Find your next stop." variant="login">
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Hop in</Text>
          <Text style={styles.sectionHint}>Log in to keep exploring.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>EMAIL OR USERNAME<Text style={styles.requiredMark}> *</Text></Text>
            <TextInput
              accessibilityLabel="Email or username"
              autoCapitalize="none"
              onChangeText={setUsername}
              placeholder="Enter email or username"
              placeholderTextColor="#8a94a6"
              style={styles.input}
              value={username}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>PASSWORD<Text style={styles.requiredMark}> *</Text></Text>
            <View style={styles.passwordField}>
              <TextInput
                accessibilityLabel="Password"
                onChangeText={setPassword}
                placeholder="Enter password"
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
                <Ionicons color="#666666" name={showPassword ? "eye-off-outline" : "eye-outline"} size={19} />
              </Pressable>
            </View>
          </View>

          {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
          <Pressable
            disabled={isSigningIn}
            onPress={handleLogin}
            style={[styles.button, isSigningIn && styles.disabledButton]}
          >
            {isSigningIn ? <ActivityIndicator color="#0B4F6C" /> : <Text style={styles.buttonText}>Sign in</Text>}
          </Pressable>
          <Pressable onPress={() => router.push("/signup")} style={styles.signupLink}>
            <Text style={styles.signupText}>
              New here? <Text style={styles.signupStrong}>Sign up</Text>
            </Text>
          </Pressable>
        </View>
      </AuthLayout>

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
  container: { flex: 1, backgroundColor: "#0B4F6C" },
  card: { gap: 16 },
  sectionTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "600", lineHeight: 32 },
  sectionHint: { color: "#A9C9DA", fontSize: 13, lineHeight: 19 },
  field: { gap: 6 },
  label: { color: "#A9C9DA", fontSize: 10, fontWeight: "600", letterSpacing: 1.2 },
  requiredMark: { color: "#FF8B82" },
  input: {
    backgroundColor: "#FFFFFF", borderColor: "#EEF0F2", borderRadius: 4,
    borderWidth: 1, color: "#1A1A1A", fontSize: 14, minHeight: 46,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  passwordField: {
    alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#EEF0F2",
    borderRadius: 4, borderWidth: 1, flexDirection: "row", minHeight: 46,
  },
  passwordInput: {
    color: "#1A1A1A", flex: 1, minWidth: 0, fontSize: 14, minHeight: 44,
    paddingLeft: 14, paddingRight: 8, paddingVertical: 12,
  },
  iconButton: { alignItems: "center", minHeight: 44, justifyContent: "center", width: 44 },
  errorText: { color: "#FFD1CC", fontSize: 13, lineHeight: 18 },
  button: {
    alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 4,
    justifyContent: "center", minHeight: 50, padding: 14,
  },
  buttonText: { color: "#0B4F6C", fontSize: 15, fontWeight: "600" },
  disabledButton: { opacity: 0.72 },
  signupLink: { alignItems: "center", paddingVertical: 6 },
  signupText: { color: "#A9C9DA", fontSize: 14, lineHeight: 21, textAlign: "center" },
  signupStrong: { color: "#FFFFFF", fontWeight: "600" },
  loadingOverlay: {
    alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.42)", flex: 1,
    justifyContent: "center",
  },
  loadingBox: {
    alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 4,
    gap: 12, minWidth: 180, padding: 20,
  },
  loadingText: { color: "#0B4F6C", fontSize: 15, fontWeight: "600" },
});
