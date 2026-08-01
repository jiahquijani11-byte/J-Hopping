import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#111827",
        tabBarInactiveTintColor: "#667085",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Admin",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="shield-checkmark-outline" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
