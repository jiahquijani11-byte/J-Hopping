import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MIDDLE_INDEX = 2;
const ACTIVE_COLOR = "#ffffff";
const INACTIVE_COLOR = "#8a94a6";
const MIDDLE_ICON_COLOR = "#111827";

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
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
          ? MIDDLE_ICON_COLOR
          : isFocused
            ? ACTIVE_COLOR
            : INACTIVE_COLOR;

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
              <View style={[styles.middleCircle, isFocused && styles.middleCircleFocused]}>{icon}</View>
              <Text style={[styles.middleLabel, { color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR }]}>
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
  middleLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
});
