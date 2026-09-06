import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createDestinationManager,
  deleteDestinationManager,
  getDestinationManager,
  type DestinationManagerPayload,
  type ManagerStatus,
  updateDestinationManager,
} from "../../lib/api";
import { toTitleCase } from "../../lib/text";

type FormValues = DestinationManagerPayload & { confirmPassword: string };
type FieldName = keyof FormValues;

const EMPTY_FORM: FormValues = {
  businessName: "",
  firstName: "",
  middleName: "",
  lastName: "",
  extensionName: "",
  email: "",
  contactNumber: "",
  username: "",
  password: "",
  confirmPassword: "",
  status: "active",
};

const STATUS_OPTIONS: { label: string; value: ManagerStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Suspended", value: "suspended" },
];

const CREATE_STEPS = [
  { fields: ["businessName", "firstName", "middleName", "lastName", "extensionName"] as FieldName[], title: "Business Details" },
  { fields: ["email", "contactNumber"] as FieldName[], title: "Contact Details" },
  { fields: ["username", "password", "confirmPassword"] as FieldName[], title: "Account Details" },
];

const OPTIONAL_FIELDS: FieldName[] = ["middleName", "extensionName"];

export function DestinationManagerForm({ managerId }: { managerId?: number }) {
  const isEditing = managerId !== undefined;
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!managerId) return;

    let active = true;

    getDestinationManager(managerId)
      .then((manager) => {
        if (!active) return;
        setForm({
          businessName: manager.businessName,
          firstName: manager.firstName,
          middleName: manager.middleName ?? "",
          lastName: manager.lastName,
          extensionName: manager.extensionName ?? "",
          email: manager.email,
          contactNumber: manager.contactNumber,
          username: manager.username,
          password: "",
          confirmPassword: "",
          status: manager.status,
        });
      })
      .catch((error) => {
        setFormError(error instanceof Error ? error.message : "Unable to load manager.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [managerId]);

  const updateField = (field: FieldName, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const validate = (fields?: FieldName[]) => {
    const nextErrors: Partial<Record<FieldName, string>> = {};
    const fieldsToValidate = fields ?? [
      "businessName",
      "firstName",
      "lastName",
      "email",
      "contactNumber",
      "username",
      "password",
      "confirmPassword",
    ];
    const required: { field: FieldName; label: string }[] = [
      { field: "businessName", label: "Business name" },
      { field: "firstName", label: "First name" },
      { field: "lastName", label: "Last name" },
      { field: "email", label: "Email" },
      { field: "contactNumber", label: "Contact number" },
      { field: "username", label: "Username" },
    ];

    required.forEach(({ field, label }) => {
      if (fieldsToValidate.includes(field) && !String(form[field] ?? "").trim()) {
        nextErrors[field] = `${label} is required.`;
      }
    });

    if (
      fieldsToValidate.includes("email") &&
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    const validatesPassword = fieldsToValidate.includes("password") || fieldsToValidate.includes("confirmPassword");

    if (validatesPassword && (!isEditing || form.password || form.confirmPassword)) {
      const strongPassword =
        form.password.length >= 8 &&
        /[A-Z]/.test(form.password) &&
        /[a-z]/.test(form.password) &&
        /\d/.test(form.password) &&
        /[^A-Za-z0-9]/.test(form.password);

      if (!form.password) {
        nextErrors.password = "Password is required.";
      } else if (!strongPassword) {
        nextErrors.password = "Use 8+ characters with uppercase, lowercase, number, and symbol.";
      }

      if (!form.confirmPassword) {
        nextErrors.confirmPassword = "Confirm the password.";
      } else if (form.confirmPassword !== form.password) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    const currentStep = CREATE_STEPS[step - 1];

    if (validate(currentStep.fields)) {
      setStep((currentStepNumber) => Math.min(currentStepNumber + 1, CREATE_STEPS.length));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    setFormError("");

    const payload: DestinationManagerPayload = {
      businessName: form.businessName.trim(),
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim(),
      lastName: form.lastName.trim(),
      extensionName: form.extensionName.trim(),
      email: form.email.trim().toLowerCase(),
      contactNumber: form.contactNumber.trim(),
      username: form.username.trim(),
      password: form.password,
      status: form.status,
    };

    try {
      if (managerId) {
        await updateDestinationManager(managerId, payload);
      } else {
        await createDestinationManager(payload);
      }
      router.back();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save manager.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!managerId) return;

    Alert.alert(
      "Delete destination manager?",
      "This permanently removes the manager profile and its login account.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsSaving(true);
            setFormError("");
            try {
              await deleteDestinationManager(managerId);
              router.back();
            } catch (error) {
              setFormError(error instanceof Error ? error.message : "Unable to delete manager.");
              setIsSaving(false);
            }
          },
        },
      ],
    );
  };

  const renderField = (
    field: FieldName,
    label: string,
    placeholder: string,
    options?: {
      autoCapitalize?: "none" | "sentences" | "words" | "characters";
      keyboardType?: "default" | "email-address" | "phone-pad";
    },
  ) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label.toUpperCase()}
        {!OPTIONAL_FIELDS.includes(field) ? <Text style={styles.requiredMark}> *</Text> : null}
      </Text>
      <TextInput
        autoCapitalize={options?.autoCapitalize}
        editable={!isSaving}
        keyboardType={options?.keyboardType}
        onChangeText={(value) => {
          const formattedValue = ["businessName", "firstName", "middleName", "lastName"].includes(field)
            ? toTitleCase(value)
            : value;
          updateField(field, formattedValue);
        }}
        placeholder={placeholder}
        placeholderTextColor="#98A2B3"
        style={[styles.input, errors[field] && styles.inputError]}
        value={String(form[field] ?? "")}
      />
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

  const renderPasswordField = (
    field: "password" | "confirmPassword",
    label: string,
    visible: boolean,
    onToggle: () => void,
  ) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label.toUpperCase()}
        {!isEditing ? <Text style={styles.requiredMark}> *</Text> : null}
      </Text>
      <View style={[styles.passwordShell, errors[field] && styles.inputError]}>
        <TextInput
          autoCapitalize="none"
          editable={!isSaving}
          onChangeText={(value) => updateField(field, value)}
          placeholder={isEditing ? "Leave blank to keep current password" : `Enter ${label.toLowerCase()}`}
          placeholderTextColor="#98A2B3"
          secureTextEntry={!visible}
          style={styles.passwordInput}
          value={form[field]}
        />
        <Pressable accessibilityLabel={visible ? "Hide password" : "Show password"} onPress={onToggle}>
          <Ionicons color="#666666" name={visible ? "eye-off-outline" : "eye-outline"} size={20} />
        </Pressable>
      </View>
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

  const renderPasswordNote = () => (
    <View style={styles.passwordNote}>
      <Ionicons color="#0B4F6C" name="information-circle-outline" size={18} />
      <Text style={styles.passwordNoteText}>
        Use 8+ characters with uppercase, lowercase, number, and special character. Passwords must match.
        {isEditing ? " Leave both password fields blank to keep the current password." : ""}
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.backRow}>
          <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color="#FFFFFF" name="chevron-back" size={24} />
          </Pressable>
          <Text style={styles.title}>{isEditing ? "Edit Destination Manager" : "New Destination Manager"}</Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        {isLoading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator color="#0B4F6C" size="large" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.stepIndicator} accessibilityLabel={`Step ${step} of ${CREATE_STEPS.length}`}>
              {CREATE_STEPS.map((createStep, index) => {
                const stepNumber = index + 1;
                const active = stepNumber === step;
                const complete = stepNumber < step;

                return (
                  <View key={createStep.title} style={styles.stepItem}>
                    <View style={[styles.stepNumber, (active || complete) && styles.stepNumberActive]}>
                      <Text style={[styles.stepNumberText, (active || complete) && styles.stepNumberTextActive]}>
                        {stepNumber}
                      </Text>
                    </View>
                    <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{createStep.title}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.sectionLabel}>
              <View style={styles.dot} />
              <Text style={styles.sectionText}>
                {CREATE_STEPS[step - 1].title.toUpperCase()}
              </Text>
            </View>

            {step === 1 ? (
              <>
                {renderField("businessName", "Business Name", "Enter business name")}
                {renderField("firstName", "First Name", "Enter first name")}
                {renderField("middleName", "Middle Name", "Optional")}
                {renderField("lastName", "Last Name", "Enter last name")}
                {renderField("extensionName", "Extension Name", "Optional")}
              </>
            ) : null}

            {step === 2 ? (
              <>
                {renderField("email", "Email", "Enter email address", {
                  autoCapitalize: "none",
                  keyboardType: "email-address",
                })}
                {renderField("contactNumber", "Contact Number", "Enter contact number", {
                  keyboardType: "phone-pad",
                })}
              </>
            ) : null}

            {step === 3 ? (
              <>
                {renderField("username", "Username", "Enter username", { autoCapitalize: "none" })}
                {renderPasswordField("password", "Password", showPassword, () => setShowPassword((value) => !value))}
                {renderPasswordField("confirmPassword", "Confirm Password", showConfirmPassword, () =>
                  setShowConfirmPassword((value) => !value),
                )}
                {renderPasswordNote()}
              </>
            ) : null}

            {isEditing && step === 3 ? (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>ACCOUNT STATUS</Text>
                <View style={styles.segmented}>
                  {STATUS_OPTIONS.map((option) => {
                    const selected = form.status === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => updateField("status", option.value)}
                        style={[styles.segment, selected && styles.segmentSelected]}
                      >
                        <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <View style={styles.stepActions}>
              <Pressable
                disabled={isSaving}
                onPress={() => {
                  if (step === 1) router.back();
                  else setStep((currentStep) => currentStep - 1);
                }}
                style={[styles.cancelButton, styles.stepButton]}
              >
                <Text style={styles.cancelText}>Back</Text>
              </Pressable>
              <Pressable
                disabled={isSaving}
                onPress={step === CREATE_STEPS.length ? handleSubmit : handleNext}
                style={[styles.primaryButton, styles.stepButton, isSaving && styles.disabled]}
              >
                {isSaving ? (
                  <ActivityIndicator color="#1A1A1A" />
                ) : (
                  <Text style={styles.primaryText}>
                    {step === CREATE_STEPS.length
                      ? isEditing
                        ? "Update Manager"
                        : "Create Manager"
                      : "Next"}
                  </Text>
                )}
              </Pressable>
            </View>
            {isEditing ? (
              <Pressable disabled={isSaving} onPress={confirmDelete} style={styles.deleteButton}>
                <Ionicons color="#C0392B" name="trash-outline" size={18} />
                <Text style={styles.deleteText}>Delete manager</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FFFFFF", flex: 1 },
  flex: { flex: 1 },
  header: { backgroundColor: "#0B4F6C", paddingBottom: 20 },
  backRow: { alignItems: "center", flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 6 },
  backButton: { alignItems: "center", height: 34, justifyContent: "center", width: 34 },
  title: { color: "#FFFFFF", flex: 1, fontSize: 21, fontWeight: "600", lineHeight: 26 },
  loadingArea: { alignItems: "center", flex: 1, justifyContent: "center" },
  content: { gap: 18, paddingBottom: 32, paddingHorizontal: 16, paddingTop: 22 },
  stepIndicator: { flexDirection: "row", justifyContent: "space-between" },
  stepItem: { alignItems: "center", flex: 1, gap: 6 },
  stepNumber: {
    alignItems: "center",
    backgroundColor: "#EEF0F2",
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  stepNumberActive: { backgroundColor: "#0B4F6C" },
  stepNumberText: { color: "#667085", fontSize: 11, fontWeight: "700" },
  stepNumberTextActive: { color: "#FFFFFF" },
  stepLabel: { color: "#98A2B3", fontSize: 10, fontWeight: "600", textAlign: "center" },
  stepLabelActive: { color: "#0B4F6C" },
  sectionLabel: { alignItems: "center", flexDirection: "row", gap: 8 },
  dot: { backgroundColor: "#4A9FD8", borderRadius: 3, height: 5, width: 5 },
  sectionText: { color: "#666666", fontSize: 11, fontWeight: "600", letterSpacing: 1.4 },
  field: { gap: 6 },
  fieldLabel: { color: "#666666", fontSize: 10, fontWeight: "600", letterSpacing: 1.2 },
  requiredMark: { color: "#C0392B" },
  input: {
    borderColor: "#EEF0F2",
    borderRadius: 4,
    borderWidth: 1,
    color: "#1A1A1A",
    fontSize: 14,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  passwordShell: {
    alignItems: "center",
    borderColor: "#EEF0F2",
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 46,
    paddingHorizontal: 14,
  },
  passwordInput: { color: "#1A1A1A", flex: 1, fontSize: 14, minHeight: 44, padding: 0 },
  passwordNote: {
    alignItems: "flex-start",
    backgroundColor: "#EAF5FB",
    borderColor: "#B3D9F0",
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 10,
  },
  passwordNoteText: { color: "#28546A", flex: 1, fontSize: 12, lineHeight: 17 },
  inputError: { borderColor: "#C0392B" },
  errorText: { color: "#C0392B", fontSize: 12 },
  segmented: { backgroundColor: "#F7F8F9", borderRadius: 4, flexDirection: "row", padding: 3 },
  segment: { alignItems: "center", borderRadius: 4, flex: 1, paddingVertical: 9 },
  segmentSelected: { backgroundColor: "#0A0A0A" },
  segmentText: { color: "#666666", fontSize: 13, fontWeight: "600" },
  segmentTextSelected: { color: "#FFFFFF" },
  formError: { color: "#C0392B", fontSize: 13, fontWeight: "600", textAlign: "center" },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#4A9FD8",
    borderRadius: 4,
    justifyContent: "center",
    minHeight: 50,
  },
  primaryText: { color: "#1A1A1A", fontSize: 15, fontWeight: "600" },
  stepActions: { flexDirection: "row", gap: 10 },
  stepButton: { flex: 1 },
  cancelButton: {
    alignItems: "center",
    borderColor: "#0A0A0A",
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 50,
  },
  cancelText: { color: "#1A1A1A", fontSize: 15, fontWeight: "600" },
  deleteButton: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center", paddingVertical: 12 },
  deleteText: { color: "#C0392B", fontSize: 14, fontWeight: "600" },
  disabled: { opacity: 0.65 },
});
