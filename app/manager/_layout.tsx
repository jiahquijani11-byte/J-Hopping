import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { AppTabBar } from "../../components/AppTabBar";

export default function ManagerTabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AppTabBar {...props} variant="manager" />}
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
        name="showcase"
        options={{
          title: "Showcase",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons color={color} name={focused ? "images" : "images-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({ focused, color, size }) => (
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
