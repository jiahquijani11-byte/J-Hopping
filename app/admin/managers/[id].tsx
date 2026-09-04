import { useLocalSearchParams } from "expo-router";
import { DestinationManagerForm } from "../../../components/admin/DestinationManagerForm";

export default function EditDestinationManager() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const managerId = Number(id);

  return <DestinationManagerForm managerId={Number.isFinite(managerId) ? managerId : undefined} />;
}
