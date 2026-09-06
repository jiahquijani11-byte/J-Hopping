import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type SuccessModalProps = {
  message: string;
  onClose: () => void;
  visible: boolean;
};

export function SuccessModal({ message, onClose, visible }: SuccessModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View style={styles.iconCircle}>
            <Ionicons color="#1E8E5A" name="checkmark" size={32} />
          </View>
          <Text style={styles.title}>{message}</Text>
          <Pressable onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)", flex: 1, justifyContent: "center", padding: 24 },
  modal: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 8, maxWidth: 360, padding: 24, width: "100%" },
  iconCircle: { alignItems: "center", backgroundColor: "rgba(30, 142, 90, 0.12)", borderRadius: 30, height: 60, justifyContent: "center", width: 60 },
  title: { color: "#111827", fontSize: 18, fontWeight: "700", lineHeight: 25, marginTop: 16, textAlign: "center" },
  button: { alignItems: "center", backgroundColor: "#4A9FD8", borderRadius: 4, justifyContent: "center", marginTop: 22, minHeight: 48, width: "100%" },
  buttonText: { color: "#1A1A1A", fontSize: 15, fontWeight: "600" },
});
