import { Ionicons } from "@expo/vector-icons";
import { useState, type PropsWithChildren } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../lib/auth-context";
import { formatProfileName } from "../../lib/text";

type ManagerLayoutProps = PropsWithChildren<{
  scrollable?: boolean;
  title?: string;
  subtitle?: string;
}>;

export function ManagerLayout({ children, scrollable = false, title = "Home", subtitle }: ManagerLayoutProps) {
  const { user } = useAuth();
  const managerName = formatProfileName(user ?? {}) || user?.username || "Destination Manager";
  const avatarLetter = (user?.firstName?.trim() || managerName).charAt(0).toUpperCase() || "D";
  const avatarUri = user?.profilePictureCacheUri || user?.profilePictureUrl;
  const [failedAvatarUri, setFailedAvatarUri] = useState<string | null>(null);
  const showProfilePicture = Boolean(avatarUri && failedAvatarUri !== avatarUri);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.greetingRow}>
          <View style={styles.avatar}>
            {showProfilePicture ? (
              <Image
                onError={() => setFailedAvatarUri(avatarUri!)}
                source={
                  avatarUri!.startsWith("file:")
                    ? { uri: avatarUri! }
                    : { headers: { Authorization: `Bearer ${user?.authToken}` }, uri: avatarUri! }
                }
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            )}
          </View>
          <View style={styles.greetingText}>
            <Text style={styles.hello}>Hello 👋</Text>
            <Text numberOfLines={1} style={styles.name}>{managerName}</Text>
          </View>
          <Ionicons color="#FFFFFF" name="notifications-outline" size={22} />
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </SafeAreaView>
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7F8F9", flex: 1 },
  header: { backgroundColor: "#0B4F6C", paddingBottom: 22, paddingHorizontal: 16 },
  greetingRow: { alignItems: "center", flexDirection: "row", gap: 12, paddingTop: 10 },
  avatar: { alignItems: "center", backgroundColor: "#B3D9F0", borderRadius: 22, height: 42, justifyContent: "center", overflow: "hidden", width: 42 },
  avatarImage: { height: "100%", width: "100%" },
  avatarLetter: { color: "#0B4F6C", fontSize: 18, fontWeight: "800" },
  greetingText: { flex: 1, gap: 2 },
  hello: { color: "#A9C9DA", fontSize: 12 },
  name: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "600", lineHeight: 34, marginTop: 16 },
  subtitle: { color: "#A9C9DA", fontSize: 13, marginTop: 6 },
  content: { flex: 1, paddingBottom: 112, paddingHorizontal: 16, paddingTop: 18 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 112, paddingHorizontal: 16, paddingTop: 18 },
});
