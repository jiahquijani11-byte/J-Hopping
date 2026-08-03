import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { AppTabBar } from "../../components/AppTabBar";

export default function UserTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#8a94a6",
      }}
      tabBar={(props) => <AppTabBar {...props} />}
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
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons color={color} name={focused ? "compass" : "compass-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "My Trips",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons color={color} name={focused ? "map" : "map-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons color={color} name={focused ? "heart" : "heart-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons color={color} name={focused ? "person" : "person-outline"} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
