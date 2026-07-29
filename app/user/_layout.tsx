import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function UserTabsLayout() {
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
          title: "User",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="person-circle-outline" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
