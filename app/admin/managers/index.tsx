import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { SuccessModal } from "../../../components/SuccessModal";
import { useAuth } from "../../../lib/auth-context";
import {
  getDestinationManagers,
  type DestinationManager,
  type DestinationManagerPage,
  type ManagerStatus,
} from "../../../lib/api";
import { formatProfileName } from "../../../lib/text";

type Filter = "all" | ManagerStatus;

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Suspended", value: "suspended" },
];
const PER_PAGE_OPTIONS = [5, 10, 20, 30] as const;
const SUCCESS_MESSAGES: Record<string, string> = {
  created: "Destination Manager Created Successfully",
  deleted: "Destination Manager Deleted Successfully",
  updated: "Destination Manager Updated Successfully",
};
const EMPTY_META: DestinationManagerPage["meta"] = {
  page: 1,
  perPage: 5,
  pendingCount: 0,
  total: 0,
  totalPages: 1,
};
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
  const { success } = useLocalSearchParams<{ success?: string }>();
  const [managers, setManagers] = useState<DestinationManager[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<(typeof PER_PAGE_OPTIONS)[number]>(5);
  const [meta, setMeta] = useState(EMPTY_META);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadManagers = useCallback(async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setError("");

    try {
      const result = await getDestinationManagers({ page, perPage, search: query, status: filter });
      setManagers(result.data);
      setMeta(result.meta);
      if (result.meta.page !== page) setPage(result.meta.page);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load managers.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filter, page, perPage, query]);

  useFocusEffect(useCallback(() => { loadManagers(); }, [loadManagers]));

  useEffect(() => {
    const successKey = Array.isArray(success) ? success[0] : success;
    const message = successKey ? SUCCESS_MESSAGES[successKey] : "";

    if (message) {
      setSuccessMessage(message);
      router.setParams({ success: "" });
    }
  }, [success]);

  const adminName = formatProfileName(user ?? {}) || user?.username || "Administrator";
  const adminInitials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((part) => part?.[0]?.toUpperCase())
    .join("") || "AD";
  const range = useMemo(() => {
    if (meta.total === 0) return "Showing 0 of 0";
    const first = (meta.page - 1) * meta.perPage + 1;
    const last = Math.min(meta.page * meta.perPage, meta.total);
    return `Showing ${first}–${last} of ${meta.total}`;
  }, [meta]);

  const header = (
    <>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.greetingRow}>
          <View style={styles.adminAvatar}><Text style={styles.adminInitials}>{adminInitials}</Text></View>
          <View style={styles.greetingText}>
            <Text style={styles.hello}>Hello 👋</Text>
            <Text style={styles.adminName}>{adminName}</Text>
          </View>
          <Ionicons color="#FFFFFF" name="notifications-outline" size={22} />
        </View>
        <Text style={styles.pageTitle}>Destination Managers</Text>
        <Text style={styles.subtitle}>
          {meta.total} {meta.total === 1 ? "manager" : "managers"} · {meta.pendingCount} pending approval
        </Text>
      </SafeAreaView>

      <View style={styles.controls}>
        <View style={styles.searchShell}>
          <Ionicons color="#666666" name="search-outline" size={18} />
          <TextInput
            autoCapitalize="none"
            onChangeText={(value) => {
              setQuery(value);
              setPage(1);
            }}
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
                onPress={() => {
                  setFilter(item.value);
                  setPage(1);
                }}
                style={[styles.filter, selected && styles.filterSelected]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.perPageRow}>
          <Text style={styles.perPageLabel}>ROWS PER PAGE</Text>
          <View style={styles.perPageOptions}>
            {PER_PAGE_OPTIONS.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setPerPage(option);
                  setPage(1);
                }}
                style={[styles.perPageOption, perPage === option && styles.perPageOptionSelected]}
              >
                <Text style={[styles.perPageText, perPage === option && styles.perPageTextSelected]}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Pressable onPress={() => router.push("/admin/managers/new")} style={styles.newButton}>
          <Ionicons color="#1A1A1A" name="add" size={19} />
          <Text style={styles.newButtonText}>New Destination Manager</Text>
        </Pressable>
        <View style={styles.listLabel}>
          <View style={styles.dot} />
          <Text style={styles.listLabelText}>{range.toUpperCase()}</Text>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.screen}>
      {isLoading ? (
        <>
          {header}
          <View style={styles.centerState}><ActivityIndicator color="#0B4F6C" size="large" /></View>
        </>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={managers}
          keyExtractor={(manager) => String(manager.id)}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons color="#98A2B3" name="people-outline" size={36} />
              <Text style={styles.emptyTitle}>{error || "No destination managers found."}</Text>
              {error ? <Pressable onPress={() => loadManagers()} style={styles.retryButton}><Text style={styles.retryText}>Try again</Text></Pressable> : null}
            </View>
          }
          ListFooterComponent={
            <View style={styles.pagination}>
              <Pressable disabled={meta.page <= 1} onPress={() => setPage((current) => current - 1)} style={[styles.pageButton, meta.page <= 1 && styles.disabled]}>
                <Ionicons color="#1A1A1A" name="chevron-back" size={18} />
                <Text style={styles.pageButtonText}>Previous</Text>
              </Pressable>
              <Text style={styles.pageText}>Page {meta.page} of {meta.totalPages}</Text>
              <Pressable disabled={meta.page >= meta.totalPages} onPress={() => setPage((current) => current + 1)} style={[styles.pageButton, meta.page >= meta.totalPages && styles.disabled]}>
                <Text style={styles.pageButtonText}>Next</Text>
                <Ionicons color="#1A1A1A" name="chevron-forward" size={18} />
              </Pressable>
            </View>
          }
          ListHeaderComponent={header}
          refreshControl={<RefreshControl colors={["#0B4F6C"]} onRefresh={() => loadManagers(true)} refreshing={isRefreshing} tintColor="#0B4F6C" />}
          renderItem={({ item, index }) => {
            const colors = STATUS_COLORS[item.status];
            return (
              <Pressable onPress={() => router.push({ pathname: "/admin/managers/[id]", params: { id: String(item.id) } })} style={[styles.managerRow, index === 0 && styles.firstManagerRow]}>
                <View style={styles.managerAvatar}><Text style={styles.managerInitials}>{initials(item.businessName)}</Text></View>
                <View style={styles.managerText}>
                  <Text numberOfLines={1} style={styles.businessName}>{item.businessName}</Text>
                  <Text numberOfLines={1} style={styles.managerMeta}>{fullName(item)} · {item.email}</Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: colors.background }]}><Text style={[styles.statusText, { color: colors.text }]}>{item.status[0].toUpperCase() + item.status.slice(1)}</Text></View>
              </Pressable>
            );
          }}
        />
      )}
      <SuccessModal message={successMessage} onClose={() => setSuccessMessage("")} visible={Boolean(successMessage)} />
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
  perPageRow: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between" },
  perPageLabel: { color: "#666666", fontSize: 10, fontWeight: "600", letterSpacing: 1.1 },
  perPageOptions: { flexDirection: "row", gap: 6 },
  perPageOption: { borderColor: "#EEF0F2", borderRadius: 4, borderWidth: 1, minWidth: 34, paddingHorizontal: 8, paddingVertical: 7 },
  perPageOptionSelected: { backgroundColor: "#0B4F6C", borderColor: "#0B4F6C" },
  perPageText: { color: "#666666", fontSize: 12, fontWeight: "600", textAlign: "center" },
  perPageTextSelected: { color: "#FFFFFF" },
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
  pagination: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginHorizontal: 16, paddingTop: 20 },
  pageButton: { alignItems: "center", borderColor: "#EEF0F2", borderRadius: 4, borderWidth: 1, flexDirection: "row", gap: 3, minHeight: 38, paddingHorizontal: 9 },
  pageButtonText: { color: "#1A1A1A", fontSize: 12, fontWeight: "600" },
  pageText: { color: "#666666", fontSize: 12 },
  centerState: { alignItems: "center", flex: 1, justifyContent: "center" },
  emptyState: { alignItems: "center", marginHorizontal: 24, paddingVertical: 42 },
  emptyTitle: { color: "#667085", fontSize: 14, marginTop: 10, textAlign: "center" },
  retryButton: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 9 },
  retryText: { color: "#0B4F6C", fontSize: 14, fontWeight: "700" },
  disabled: { opacity: 0.42 },
});
