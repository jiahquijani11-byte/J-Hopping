import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { AuthLayout } from "../components/AuthLayout";
import { signupUser } from "../lib/api";
import { toTitleCase } from "../lib/text";

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Bisexual", value: "bisexual" },
  { label: "Gay", value: "gay" },
  { label: "Lesbian", value: "lesbian" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
] as const;

type Gender = (typeof genderOptions)[number]["value"];

type SignupForm = {
  firstName: string;
  middleInitial: string;
  lastName: string;
  extensionName: string;
  birthDate: string;
  gender: Gender | "";
  email: string;
  contactNumber: string;
  country: string;
  username: string;
  password: string;
  confirmPassword: string;
};

type FieldName = keyof SignupForm;

const initialForm: SignupForm = {
  firstName: "",
  middleInitial: "",
  lastName: "",
  extensionName: "",
  birthDate: "",
  gender: "",
  email: "",
  contactNumber: "",
  country: "",
  username: "",
  password: "",
  confirmPassword: "",
};

const toISODate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const isValidISODate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const formatBirthDate = (value: string) => {
  if (!isValidISODate(value)) return "Select birth date";

  const [year, month, day] = value.split("-").map(Number);

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

const calculateAge = (value: string) => {
  if (!isValidISODate(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  if (birthDate > today) return null;

  let age = today.getFullYear() - year;
  const birthdayHasNotOccurred =
    today.getMonth() < month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() < day);

  if (birthdayHasNotOccurred) age -= 1;

  return age > 0 ? age : null;
};

export default function Signup() {
  const { width, fontScale } = useWindowDimensions();
  const stackFields = width < 360 || fontScale > 1.2;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [birthDateValue, setBirthDateValue] = useState(new Date(2000, 0, 1));
  const [webDateInput, setWebDateInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const stepTitle = useMemo(() => {
    if (step === 1) {
      return "Personal details";
    }

    if (step === 2) {
      return "Contact details";
    }

    return "Account details";
  }, [step]);

  const updateField = (field: FieldName, value: string) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setFormError("");
  };

  const validateStep = (targetStep = step) => {
    const nextErrors: Partial<Record<FieldName, string>> = {};

    if (targetStep === 1) {
      if (!form.firstName.trim()) nextErrors.firstName = "Firstname is required.";
      if (!form.lastName.trim()) nextErrors.lastName = "Lastname is required.";
      if (!form.birthDate.trim()) {
        nextErrors.birthDate = "Birth date is required.";
      } else if (!isValidISODate(form.birthDate) || !calculateAge(form.birthDate)) {
        nextErrors.birthDate = "Enter a valid birth date.";
      }
      if (!form.gender) nextErrors.gender = "Gender is required.";
    }

    if (targetStep === 2) {
      const email = form.email.trim().toLowerCase();

      if (!email) {
        nextErrors.email = "Email address is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nextErrors.email = "Enter a valid email address.";
      }

      if (!form.contactNumber.trim()) nextErrors.contactNumber = "Contact number is required.";
      if (!form.country.trim()) nextErrors.country = "Country is required.";
    }

    if (targetStep === 3) {
      const passwordIsStrong =
        form.password.length >= 8 &&
        /[A-Z]/.test(form.password) &&
        /[a-z]/.test(form.password) &&
        /\d/.test(form.password) &&
        /[^A-Za-z0-9]/.test(form.password);

      if (!form.username.trim()) nextErrors.username = "Username is required.";
      if (!form.password) {
        nextErrors.password = "Password is required.";
      } else if (!passwordIsStrong) {
        nextErrors.password =
          "Use 8+ characters with uppercase, lowercase, number, and special character.";
      }
      if (!form.confirmPassword) {
        nextErrors.confirmPassword = "Confirm your password.";
      } else if (form.confirmPassword !== form.password) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((currentStep) => Math.min(currentStep + 1, 3));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      await signupUser({
        firstName: form.firstName.trim(),
        middleInitial: form.middleInitial.trim(),
        lastName: form.lastName.trim(),
        extensionName: form.extensionName.trim(),
        birthDate: form.birthDate,
        gender: form.gender as Gender,
        email: form.email.trim().toLowerCase(),
        contactNumber: form.contactNumber.trim(),
        country: form.country.trim(),
        username: form.username.trim(),
        password: form.password,
      });
      router.replace("/login");
    } catch (signupError) {
      const message =
        signupError instanceof Error ? signupError.message : "Unable to save your account.";

      setFormError(message);

      if (message.toLowerCase().includes("email")) {
        setStep(2);
        setErrors({ email: message });
      } else if (message.toLowerCase().includes("username")) {
        setStep(3);
        setErrors({ username: message });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDatePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);

      if (event.type === "set" && selectedDate) {
        setBirthDateValue(selectedDate);
        updateField("birthDate", toISODate(selectedDate));
      }

      return;
    }

    if (event.type === "set" && selectedDate) {
      setBirthDateValue(selectedDate);
    }
  };

  const confirmBirthDate = () => {
    updateField("birthDate", toISODate(birthDateValue));
    setShowDatePicker(false);
  };

  const handleWebDateChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 8);
    const parts: string[] = [];

    if (digits.length > 0) parts.push(digits.slice(0, 2));
    if (digits.length > 2) parts.push(digits.slice(2, 4));
    if (digits.length > 4) parts.push(digits.slice(4, 8));

    setWebDateInput(parts.join("/"));

    if (digits.length === 8) {
      updateField(
        "birthDate",
        `${digits.slice(4, 8)}-${digits.slice(0, 2)}-${digits.slice(2, 4)}`,
      );
    } else if (form.birthDate) {
      updateField("birthDate", "");
    }
  };

  const formatFieldValue = (field: FieldName, value: string) => {
    if (field === "middleInitial") return value.replace(/[^A-Za-z]/g, "").slice(0, 1);
    if (field === "extensionName") return value.replace(/[^A-Za-z.]/g, "").slice(0, 3);
    if (field === "firstName" || field === "lastName" || field === "country") {
      return toTitleCase(value);
    }

    return value;
  };

  const renderLabel = (label: string, required = true) => (
    <Text style={styles.label}>
      {label}
      {required ? <Text style={styles.requiredMark}> *</Text> : null}
    </Text>
  );

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
      {renderLabel(label, field !== "middleInitial" && field !== "extensionName")}
      <View style={[styles.inputShell, errors[field] && styles.inputError]}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize={options?.autoCapitalize}
          keyboardType={options?.keyboardType}
          maxLength={field === "middleInitial" ? 1 : field === "extensionName" ? 3 : undefined}
          onChangeText={(value) => updateField(field, formatFieldValue(field, value))}
          placeholder={placeholder}
          placeholderTextColor="#8a94a6"
          style={styles.input}
          value={form[field]}
        />
      </View>
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

  const renderPasswordField = (
    field: "password" | "confirmPassword",
    label: string,
    placeholder: string,
    visible: boolean,
    onToggle: () => void,
  ) => (
    <View style={styles.field}>
      {renderLabel(label)}
      <View style={[styles.inputShell, errors[field] && styles.inputError]}>
        <TextInput
          onChangeText={(value) => updateField(field, value)}
          placeholder={placeholder}
          placeholderTextColor="#8a94a6"
          secureTextEntry={!visible}
          style={styles.input}
          value={form[field]}
        />
        <Pressable accessibilityLabel={visible ? "Hide password" : "Show password"} onPress={onToggle} style={styles.eyeButton}>
          <Ionicons color="#666666" name={visible ? "eye-off-outline" : "eye-outline"} size={19} />
        </Pressable>
      </View>
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

  const renderDateField = () => (
    <View style={styles.field}>
      {renderLabel("Birth Date")}
      {Platform.OS === "web" ? (
        <View style={[styles.inputShell, errors.birthDate && styles.inputError]}>
          <TextInput
            onChangeText={handleWebDateChange}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#8a94a6"
            style={styles.input}
            value={webDateInput}
          />
          <Ionicons color="#666666" name="calendar-outline" size={18} />
        </View>
      ) : (
        <Pressable
          accessibilityHint="Opens the birth date calendar"
          accessibilityRole="button"
          onPress={() => setShowDatePicker(true)}
          style={[styles.inputShell, errors.birthDate && styles.inputError]}
        >
          <Text style={[styles.dateText, !form.birthDate && styles.placeholderText]}>
            {formatBirthDate(form.birthDate)}
          </Text>
          <Ionicons color="#666666" name="calendar-outline" size={18} />
        </Pressable>
      )}
      {errors.birthDate ? <Text style={styles.errorText}>{errors.birthDate}</Text> : null}
    </View>
  );

  const renderAgeField = () => (
    <View style={styles.field}>
      {renderLabel("Age", false)}
      <View style={styles.disabledInputShell}>
        <Text style={[styles.dateText, !form.birthDate && styles.placeholderText]}>
          {calculateAge(form.birthDate)?.toString() ?? "Calculated from birth date"}
        </Text>
      </View>
    </View>
  );

  const renderGenderField = () => {
    const selectedGender = genderOptions.find((option) => option.value === form.gender);

    return (
      <View style={styles.field}>
        {renderLabel("Gender")}
        <Pressable
          accessibilityHint="Opens the gender selection"
          accessibilityRole="button"
          onPress={() => setShowGenderPicker(true)}
          style={[styles.inputShell, errors.gender && styles.inputError]}
        >
          <Text style={[styles.dateText, !selectedGender && styles.placeholderText]}>
            {selectedGender?.label ?? "Select gender"}
          </Text>
          <Ionicons color="#666666" name="chevron-down-outline" size={18} />
        </Pressable>
        {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AuthLayout
        title="Create account"
        subtitle={step === 1 ? "Tell us who you are." : step === 2 ? "Where can we reach you?" : "Secure your account."}
      >
        <View style={styles.card}>
          <View accessibilityLabel={`Step ${step} of 3`} style={styles.stepDots}>
            {[1, 2, 3].map((number) => (
              <View key={number} style={[styles.stepDot, step === number && styles.activeStepDot]} />
            ))}
          </View>
          <Text style={styles.title}>{stepTitle}</Text>
          {step === 1 ? (
            <View style={styles.fields}>
              {renderField("firstName", "Firstname", "Enter firstname")}
              <View style={[styles.fieldRow, stackFields && styles.stackedRow]}>
                <View style={styles.column}>{renderField("middleInitial", "Middle Initial", "Optional")}</View>
                <View style={styles.column}>{renderField("extensionName", "Extension Name", "Optional")}</View>
              </View>
              {renderField("lastName", "Lastname", "Enter lastname")}
              <View style={[styles.fieldRow, stackFields && styles.stackedRow]}>
                <View style={styles.column}>{renderDateField()}</View>
                <View style={styles.column}>{renderAgeField()}</View>
              </View>
              {renderGenderField()}
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.fields}>
              {renderField("email", "Email Address", "Enter email address", {
                autoCapitalize: "none",
                keyboardType: "email-address",
              })}
              {renderField("contactNumber", "Contact Number", "Enter contact number", {
                keyboardType: "phone-pad",
              })}
              {renderField("country", "Country", "Enter country")}
            </View>
          ) : null}

          {step === 3 ? (
            <View style={styles.fields}>
              {renderField("username", "Username", "Choose username", {
                autoCapitalize: "none",
              })}
              {renderPasswordField("password", "Password", "Create password", showPassword, () =>
                setShowPassword((current) => !current),
              )}
              {renderPasswordField(
                "confirmPassword",
                "Confirm Password",
                "Repeat password",
                showConfirmPassword,
                () => setShowConfirmPassword((current) => !current),
              )}
            </View>
          ) : null}

          {step === 3 ? (
            <View style={styles.passwordHint}>
              <Ionicons color="#A9C9DA" name="information-circle-outline" size={16} />
              <Text style={styles.hintText}>
                Use 8+ characters with uppercase, lowercase, number, and special character. Both entries must match.
              </Text>
            </View>
          ) : null}

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              disabled={isSaving}
              onPress={() => {
                if (step === 1) router.replace("/login");
                else setStep((currentStep) => currentStep - 1);
              }}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
            <Pressable
              disabled={isSaving}
              onPress={step === 3 ? handleSubmit : handleNext}
              style={[styles.primaryButton, isSaving && styles.disabledButton]}
            >
              {isSaving ? (
                <ActivityIndicator color="#0B4F6C" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {step === 3 ? "Create Account" : "Next"}
                </Text>
              )}
            </Pressable>
          </View>

          <Pressable onPress={() => router.push("/login")} style={styles.loginLink}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginStrong}>Login</Text>
            </Text>
          </Pressable>

        </View>
      </AuthLayout>

      {showDatePicker && Platform.OS === "android" ? (
        <DateTimePicker
          display="calendar"
          maximumDate={new Date()}
          mode="date"
          onChange={handleDatePickerChange}
          value={birthDateValue}
        />
      ) : null}

      <Modal transparent visible={showDatePicker && Platform.OS === "ios"} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.dateModal}>
            <Text style={styles.dateTitle}>Select Birth Date</Text>
            <DateTimePicker
              accentColor="#0B4F6C"
              display="inline"
              maximumDate={new Date()}
              mode="date"
              onChange={handleDatePickerChange}
              themeVariant="light"
              value={birthDateValue}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setShowDatePicker(false)} style={styles.cancelDateButton}>
                <Text style={styles.cancelDateText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={confirmBirthDate} style={styles.confirmDateButton}>
                <Text style={styles.confirmDateText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showGenderPicker} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.genderModal}>
            <View style={styles.genderModalHeader}>
              <Text style={styles.genderTitle}>Select Gender</Text>
              <Pressable
                accessibilityLabel="Close gender selection"
                accessibilityRole="button"
                onPress={() => setShowGenderPicker(false)}
                style={styles.genderCloseButton}
              >
                <Ionicons color="#111827" name="close" size={22} />
              </Pressable>
            </View>
            {genderOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  updateField("gender", option.value);
                  setShowGenderPicker(false);
                }}
                style={styles.genderOption}
              >
                <Text style={styles.genderOptionText}>{option.label}</Text>
                {form.gender === option.value ? (
                  <Ionicons color="#0B4F6C" name="checkmark" size={20} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      <Modal transparent visible={isSaving} animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#111827" />
            <Text style={styles.loadingText}>Saving account...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#0B4F6C", flex: 1 },
  card: { gap: 14 },
  stepDots: { flexDirection: "row", gap: 6, alignItems: "center" },
  stepDot: { height: 4, width: 8, borderRadius: 2, backgroundColor: "#FFFFFF59" },
  activeStepDot: { width: 22, backgroundColor: "#FFFFFF" },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "600", lineHeight: 28 },
  fields: { gap: 14 },
  field: { gap: 6 },
  fieldRow: { flexDirection: "row", gap: 12 },
  stackedRow: { flexDirection: "column" },
  column: { flex: 1, minWidth: 0 },
  label: { color: "#A9C9DA", fontSize: 10, fontWeight: "600", letterSpacing: 1.2, textTransform: "uppercase" },
  requiredMark: { color: "#FF8B82" },
  inputShell: {
    alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#EEF0F2",
    borderRadius: 4, borderWidth: 1, flexDirection: "row", minHeight: 46, paddingHorizontal: 14,
  },
  inputError: { borderColor: "#FFB4AB" },
  disabledInputShell: {
    alignItems: "center", backgroundColor: "#E8EEF1", borderColor: "#D9E1E6",
    borderRadius: 4, borderWidth: 1, flexDirection: "row", minHeight: 46, paddingHorizontal: 14,
  },
  input: { color: "#1A1A1A", flex: 1, minWidth: 0, fontSize: 14, minHeight: 44, paddingHorizontal: 0, paddingVertical: 12 },
  eyeButton: { minHeight: 44, width: 32, alignItems: "flex-end", justifyContent: "center" },
  dateText: { color: "#1A1A1A", flex: 1, fontSize: 14, paddingVertical: 12 },
  placeholderText: { color: "#8a94a6" },
  errorText: { color: "#FFD1CC", fontSize: 12, lineHeight: 17 },
  formError: { color: "#FFD1CC", fontSize: 13, lineHeight: 18 },
  passwordHint: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "#FFFFFF1A", borderRadius: 4, padding: 12 },
  hintText: { flex: 1, color: "#A9C9DA", fontSize: 11, lineHeight: 16 },
  actions: { flexDirection: "row", gap: 10 },
  primaryButton: {
    alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 4,
    flex: 1, justifyContent: "center", minHeight: 50, paddingHorizontal: 12, paddingVertical: 14,
  },
  primaryButtonText: { color: "#0B4F6C", fontSize: 15, fontWeight: "600", textAlign: "center" },
  secondaryButton: {
    alignItems: "center", borderColor: "#FFFFFF59", borderRadius: 4, borderWidth: 1,
    flex: 1, justifyContent: "center", minHeight: 50, paddingHorizontal: 12, paddingVertical: 14,
  },
  secondaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  disabledButton: { opacity: 0.72 },
  loginLink: { alignItems: "center", paddingVertical: 6 },
  loginText: { color: "#A9C9DA", fontSize: 13, lineHeight: 20, textAlign: "center" },
  loginStrong: { color: "#FFFFFF", fontWeight: "600" },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  dateModal: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    maxWidth: 380,
    padding: 18,
    width: "100%",
  },
  genderModal: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    maxWidth: 380,
    padding: 18,
    width: "100%",
  },
  genderModalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  genderTitle: { color: "#111827", fontSize: 20, fontWeight: "800" },
  genderCloseButton: { alignItems: "center", height: 36, justifyContent: "center", width: 36 },
  genderOption: {
    alignItems: "center",
    borderBottomColor: "#E7ECEF",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 46,
    paddingHorizontal: 4,
  },
  genderOptionText: { color: "#111827", fontSize: 15 },
  dateTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  cancelDateButton: {
    alignItems: "center",
    borderColor: "#111827",
    borderRadius: 8,
    borderWidth: 1.3,
    flex: 1,
    justifyContent: "center",
    minHeight: 46,
  },
  cancelDateText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
  },
  confirmDateButton: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    minHeight: 46,
  },
  confirmDateText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  loadingOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    flex: 1,
    justifyContent: "center",
  },
  loadingBox: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    gap: 12,
    minWidth: 190,
    padding: 20,
  },
  loadingText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
  },
});
