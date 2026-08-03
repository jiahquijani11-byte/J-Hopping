import { Ionicons } from "@expo/vector-icons";
import {
  ImageBackground,
  type ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PlaceholderScreenProps = {
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function PlaceholderScreen({ image, subtitle, icon, title }: PlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <ImageBackground
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
        source={image}
        style={styles.background}
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.content}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons color="#111827" name={icon} size={40} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Coming soon</Text>
            </View>
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
    ...StyleSheet.absoluteFillObject,
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
  badge: {
    backgroundColor: "#111827",
    borderRadius: 999,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
});
