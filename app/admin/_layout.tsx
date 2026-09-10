import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { AppTabBar } from "../../components/AppTabBar";

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#8a94a6",
      }}
      tabBar={(props) => <AppTabBar {...props} variant="admin" />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons color={color} name={focused ? "home" : "home-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons color={color} name={focused ? "people" : "people-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="managers"
        options={{
          title: "Managers",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="add" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons color={color} name={focused ? "calendar" : "calendar-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons color={color} name={focused ? "settings" : "settings-outline"} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
