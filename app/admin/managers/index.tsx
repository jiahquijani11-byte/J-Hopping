import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../lib/auth-context";
import {
  getDestinationManagers,
  type DestinationManager,
  type ManagerStatus,
} from "../../../lib/api";

type Filter = "all" | ManagerStatus;

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Suspended", value: "suspended" },
];

const STATUS_COLORS: Record<ManagerStatus, { background: string; text: string }> = {
  active: { background: "rgba(30, 142, 90, 0.10)", text: "#1E8E5A" },
  pending: { background: "rgba(180, 118, 26, 0.10)", text: "#B4761A" },
  suspended: { background: "rgba(192, 57, 43, 0.10)", text: "#C0392B" },
};

const fullName = (manager: DestinationManager) =>
  [manager.firstName, manager.middleName, manager.lastName, manager.extensionName]
    .filter(Boolean)
    .join(" ");

const initials = (businessName: string) =>
  businessName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "DM";

export default function DestinationManagers() {
  const { user } = useAuth();
  const [managers, setManagers] = useState<DestinationManager[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadManagers = useCallback(async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setError("");

    try {
      setManagers(await getDestinationManagers());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load managers.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadManagers();
    }, [loadManagers]),
  );

  const visibleManagers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return managers.filter((manager) => {
      const matchesFilter = filter === "all" || manager.status === filter;
      const searchable = `${manager.businessName} ${fullName(manager)} ${manager.email} ${manager.username}`.toLowerCase();
      return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [filter, managers, query]);

  const pendingCount = managers.filter((manager) => manager.status === "pending").length;
  const adminName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Administrator";
  const adminInitials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((part) => part?.[0]?.toUpperCase())
    .join("") || "AD";

  const header = (
    <>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.greetingRow}>
          <View style={styles.adminAvatar}>
            <Text style={styles.adminInitials}>{adminInitials}</Text>
          </View>
          <View style={styles.greetingText}>
            <Text style={styles.hello}>Hello 👋</Text>
            <Text style={styles.adminName}>{adminName}</Text>
          </View>
          <Ionicons color="#FFFFFF" name="notifications-outline" size={22} />
        </View>
        <Text style={styles.pageTitle}>Destination Managers</Text>
        <Text style={styles.subtitle}>
          {managers.length} {managers.length === 1 ? "manager" : "managers"} · {pendingCount} pending approval
        </Text>
      </SafeAreaView>

      <View style={styles.controls}>
        <View style={styles.searchShell}>
          <Ionicons color="#666666" name="search-outline" size={18} />
          <TextInput
            autoCapitalize="none"
            onChangeText={setQuery}
            placeholder="Search manager or business"
            placeholderTextColor="#666666"
            style={styles.searchInput}
            value={query}
          />
        </View>
        <ScrollView horizontal contentContainerStyle={styles.filters} showsHorizontalScrollIndicator={false}>
          {FILTERS.map((item) => {
            const selected = item.value === filter;
            return (
              <Pressable
                key={item.value}
                onPress={() => setFilter(item.value)}
                style={[styles.filter, selected && styles.filterSelected]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable onPress={() => router.push("/admin/managers/new")} style={styles.newButton}>
          <Ionicons color="#1A1A1A" name="add" size={19} />
          <Text style={styles.newButtonText}>New Destination Manager</Text>
        </Pressable>
        <View style={styles.listLabel}>
          <View style={styles.dot} />
          <Text style={styles.listLabelText}>
            SHOWING {visibleManagers.length} OF {managers.length}
          </Text>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.screen}>
      {isLoading ? (
        <>
          {header}
          <View style={styles.centerState}>
            <ActivityIndicator color="#0B4F6C" size="large" />
          </View>
        </>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={visibleManagers}
          keyExtractor={(manager) => String(manager.id)}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons color="#98A2B3" name="people-outline" size={36} />
              <Text style={styles.emptyTitle}>{error || "No destination managers found."}</Text>
              {error ? (
                <Pressable onPress={() => loadManagers()} style={styles.retryButton}>
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              ) : null}
            </View>
          }
          ListHeaderComponent={header}
          refreshControl={
            <RefreshControl
              colors={["#0B4F6C"]}
              onRefresh={() => loadManagers(true)}
              refreshing={isRefreshing}
              tintColor="#0B4F6C"
            />
          }
          renderItem={({ item, index }) => {
            const colors = STATUS_COLORS[item.status];
            return (
              <Pressable
                onPress={() =>
                  router.push({ pathname: "/admin/managers/[id]", params: { id: String(item.id) } })
                }
                style={[styles.managerRow, index === 0 && styles.firstManagerRow]}
              >
                <View style={styles.managerAvatar}>
                  <Text style={styles.managerInitials}>{initials(item.businessName)}</Text>
                </View>
                <View style={styles.managerText}>
                  <Text numberOfLines={1} style={styles.businessName}>{item.businessName}</Text>
                  <Text numberOfLines={1} style={styles.managerMeta}>{fullName(item)} · {item.email}</Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: colors.background }]}>
                  <Text style={[styles.statusText, { color: colors.text }]}>
                    {item.status[0].toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FFFFFF", flex: 1 },
  header: { backgroundColor: "#0B4F6C", paddingBottom: 22, paddingHorizontal: 16 },
  greetingRow: { alignItems: "center", flexDirection: "row", gap: 12, paddingTop: 10 },
  adminAvatar: { alignItems: "center", backgroundColor: "#B3D9F0", borderRadius: 24, height: 42, justifyContent: "center", width: 42 },
  adminInitials: { color: "#1A1A1A", fontSize: 13 },
  greetingText: { flex: 1, gap: 2 },
  hello: { color: "#A9C9DA", fontSize: 12 },
  adminName: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  pageTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "600", lineHeight: 34, marginTop: 16 },
  subtitle: { color: "#A9C9DA", fontSize: 13, marginTop: 6 },
  controls: { gap: 18, paddingHorizontal: 16, paddingTop: 22 },
  searchShell: { alignItems: "center", backgroundColor: "#F7F8F9", borderColor: "#EEF0F2", borderRadius: 4, borderWidth: 1, flexDirection: "row", gap: 10, minHeight: 46, paddingHorizontal: 14 },
  searchInput: { color: "#1A1A1A", flex: 1, fontSize: 14, minHeight: 44, padding: 0 },
  filters: { gap: 8 },
  filter: { borderColor: "#EEF0F2", borderRadius: 4, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 },
  filterSelected: { backgroundColor: "#0A0A0A", borderColor: "#0A0A0A" },
  filterText: { color: "#666666", fontSize: 13, fontWeight: "500" },
  filterTextSelected: { color: "#FFFFFF" },
  newButton: { alignItems: "center", backgroundColor: "#4A9FD8", borderRadius: 4, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 47 },
  newButtonText: { color: "#1A1A1A", fontSize: 15, fontWeight: "600" },
  listLabel: { alignItems: "center", flexDirection: "row", gap: 8 },
  dot: { backgroundColor: "#4A9FD8", borderRadius: 3, height: 5, width: 5 },
  listLabelText: { color: "#666666", fontSize: 11, fontWeight: "600", letterSpacing: 1.4 },
  listContent: { paddingBottom: 24 },
  managerRow: { alignItems: "center", borderTopColor: "#EEF0F2", borderTopWidth: 1, flexDirection: "row", gap: 12, marginHorizontal: 16, paddingVertical: 10 },
  firstManagerRow: { marginTop: 8 },
  managerAvatar: { alignItems: "center", backgroundColor: "#B3D9F0", borderRadius: 4, height: 40, justifyContent: "center", width: 40 },
  managerInitials: { color: "#1A1A1A", fontSize: 13 },
  managerText: { flex: 1, gap: 2 },
  businessName: { color: "#1A1A1A", fontSize: 15, fontWeight: "600" },
  managerMeta: { color: "#666666", fontSize: 12 },
  statusTag: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { fontSize: 10, fontWeight: "600" },
  centerState: { alignItems: "center", flex: 1, justifyContent: "center" },
  emptyState: { alignItems: "center", marginHorizontal: 24, paddingVertical: 42 },
  emptyTitle: { color: "#667085", fontSize: 14, marginTop: 10, textAlign: "center" },
  retryButton: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 9 },
  retryText: { color: "#0B4F6C", fontSize: 14, fontWeight: "700" },
});
