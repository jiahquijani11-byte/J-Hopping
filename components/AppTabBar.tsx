import type { BottomTabBarProps } from "expo-router/js-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MIDDLE_INDEX = 2;
const ACTIVE_COLOR = "#ffffff";
const INACTIVE_COLOR = "#8a94a6";
const MIDDLE_ICON_COLOR = "#111827";

type AppTabBarProps = BottomTabBarProps & { variant?: "default" | "admin" | "manager" };

export function AppTabBar({ state, descriptors, navigation, variant = "default" }: AppTabBarProps) {
  const insets = useSafeAreaInsets();
  const isAdmin = variant === "admin";
  const isManager = variant === "manager";
  const activeColor = isAdmin || isManager ? "#0B4F6C" : ACTIVE_COLOR;
  const inactiveColor = isAdmin || isManager ? "#6B7684" : INACTIVE_COLOR;
  const visibleRoutes = state.routes.filter(
    (route) =>
      (descriptors[route.key].options as { href?: string | null }).href !== null &&
      !(isManager && (route.name === "business" || route.name === "reports")),
  );

  return (
    <View
      style={[
        styles.bar,
        (isAdmin || isManager) && styles.adminBar,
        { paddingBottom: Math.max(insets.bottom, isAdmin || isManager ? 14 : 10) },
      ]}
    >
      {visibleRoutes.map((route, index) => {
        const options = descriptors[route.key].options;
        const isFocused = state.index === index;
        const isMiddle = index === MIDDLE_INDEX;
        const label =
          typeof options.tabBarLabel === "string"
            ? options.tabBarLabel
            : (options.title ?? route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const color = isMiddle
          ? isAdmin
            ? "#ffffff"
            : isManager
              ? "#ffffff"
            : MIDDLE_ICON_COLOR
          : isFocused
            ? activeColor
            : inactiveColor;

        const icon = options.tabBarIcon
          ? options.tabBarIcon({
              focused: isFocused,
              color,
              size: isMiddle ? 30 : 22,
            })
          : null;

        if (isMiddle) {
          return (
            <Pressable key={route.key} onPress={onPress} onLongPress={onLongPress} style={styles.item}>
              <View
                style={[
                  styles.middleCircle,
                  (isAdmin || isManager) && styles.adminMiddleCircle,
                  !isAdmin && !isManager && isFocused && styles.middleCircleFocused,
                ]}
              >
                {icon}
              </View>
              <Text style={[styles.middleLabel, { color: isFocused ? activeColor : inactiveColor }]}>
                {label}
              </Text>
            </Pressable>
          );
        }

        return (
          <Pressable key={route.key} onPress={onPress} onLongPress={onLongPress} style={styles.item}>
            <View style={styles.icon}>{icon}</View>
            <Text style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: "flex-start",
    backgroundColor: "rgba(11, 18, 32, 0.96)",
    boxShadow: "0 -6px 20px rgba(0, 0, 0, 0.28)",
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingTop: 10,
  },
  adminBar: {
    backgroundColor: "#ffffff",
    borderTopColor: "#EEF0F2",
    borderTopWidth: 1,
    boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.08)",
    paddingTop: 8,
  },
  item: {
    alignItems: "center",
    flex: 1,
  },
  icon: {
    height: 26,
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  middleCircle: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 30,
    boxShadow: "0 8px 18px rgba(0, 0, 0, 0.35)",
    height: 60,
    justifyContent: "center",
    marginTop: -32,
    width: 60,
  },
  middleCircleFocused: {
    backgroundColor: "#eef2ff",
  },
  adminMiddleCircle: {
    backgroundColor: "#0B4F6C",
    boxShadow: "0 6px 14px rgba(11, 79, 108, 0.25)",
    height: 58,
    width: 58,
  },
  middleLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
});
