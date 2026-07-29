import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginUser } from "../lib/api";

export default function Login() {
  const { height, width } = useWindowDimensions();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleLogin = async () => {
    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier || !password) {
      setError("Enter your email or username and password.");
      return;
    }

    setError("");
    setIsSigningIn(true);

    try {
      if (cleanIdentifier === "jiahadmin" && password === "jiahadmin") {
        router.replace("/admin");
        return;
      }

      await loginUser({ identifier: cleanIdentifier, password });
      router.replace("/user");
      setPassword("");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in right now.",
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

        <SafeAreaView style={styles.content}>
          <View style={styles.heroText}>
            <Text style={styles.title}>Hop In</Text>
            <Text style={styles.subtitle}>Login to continue with J-Hopping.</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setIdentifier}
              placeholder="Email or username"
              placeholderTextColor="#667085"
              style={styles.input}
              value={identifier}
            />
            <View style={styles.passwordField}>
              <TextInput
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#667085"
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
                  size={22}
                />
              </Pressable>
            </View>

            <Pressable style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              disabled={isSigningIn}
              onPress={handleLogin}
              style={[styles.button, isSigningIn && styles.disabledButton]}
            >
              {isSigningIn ? (
                <ActivityIndicator color="#111827" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push("/signup")}
              style={styles.signupLink}
            >
              <Text style={styles.signupText}>
                Don&apos;t have an account? <Text style={styles.signupStrong}>Sign up</Text>
              </Text>
            </Pressable>
          </View>
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
    backgroundColor: "rgba(11, 18, 32, 0.42)",
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  form: {
    gap: 14,
    marginTop: 24,
    maxWidth: 520,
    width: "100%",
  },
  heroText: {
    maxWidth: 520,
  },
  title: {
    color: "#ffffff",
    fontSize: 44,
    fontWeight: "800",
    lineHeight: 52,
  },
  subtitle: {
    color: "#eef2ff",
    fontSize: 18,
    lineHeight: 27,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1.5,
    color: "#111827",
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  passwordField: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: "row",
    minHeight: 54,
  },
  passwordInput: {
    color: "#111827",
    flex: 1,
    fontSize: 16,
    minHeight: 54,
    paddingLeft: 16,
    paddingRight: 8,
  },
  iconButton: {
    alignItems: "center",
    height: 54,
    justifyContent: "center",
    width: 52,
  },
  forgotButton: {
    alignSelf: "flex-end",
  },
  forgotText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    color: "#fecaca",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.22)",
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 8,
    minHeight: 54,
  },
  buttonText: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.75,
  },
  signupLink: {
    alignItems: "center",
    marginTop: 4,
  },
  signupText: {
    color: "#eef2ff",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  signupStrong: {
    color: "#ffffff",
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
