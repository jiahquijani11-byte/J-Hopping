import type { PropsWithChildren } from "react";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AuthLayoutProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  variant?: "login" | "signup";
}>;

const fade = "linear-gradient(180deg, #0A0A0A00 0%, #0B4F6CE6 100%)";

export function AuthLayout({ children, title, subtitle, variant = "signup" }: AuthLayoutProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const isLogin = variant === "login";
  const heroHeight = Math.max(insets.top + 116, Math.min(isLogin ? 290 : 190, height * (isLogin ? 0.42 : 0.29)));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <StatusBar backgroundColor="transparent" style="light" translucent />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[styles.hero, { minHeight: heroHeight, paddingTop: insets.top + 16 }]}
        >
          <Image
            cachePolicy="memory-disk"
            contentFit="cover"
            priority="high"
            source={require("../assets/images/corousel11.png")}
            style={StyleSheet.absoluteFill}
            transition={0}
          />
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              Platform.OS === "web"
                ? { backgroundImage: fade }
                : { experimental_backgroundImage: fade },
            ]}
          />
          <View style={[styles.caption, { paddingLeft: 20 + insets.left, paddingRight: 20 + insets.right }]}>
            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>
        <View style={[
          styles.sheet,
          {
            paddingTop: isLogin ? 28 : 24,
            paddingBottom: 34 + insets.bottom,
            paddingLeft: 20 + insets.left,
            paddingRight: 20 + insets.right,
          },
        ]}>
          <View style={styles.form}>{children}</View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0B4F6C" },
  scrollContent: { flexGrow: 1 },
  hero: { backgroundColor: "#0B4F6C", justifyContent: "flex-end", overflow: "hidden" },
  caption: { alignSelf: "center", maxWidth: 560, width: "100%", gap: 5, paddingBottom: 22 },
  heroTitle: { color: "#FFFFFF", fontSize: 30, fontWeight: "600", lineHeight: 35 },
  subtitle: { color: "#A9C9DA", fontSize: 13, lineHeight: 19 },
  sheet: { flexGrow: 1, backgroundColor: "#0B4F6C" },
  form: { alignSelf: "center", maxWidth: 520, width: "100%" },
});
