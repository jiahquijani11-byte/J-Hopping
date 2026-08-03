import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signupUser } from "../lib/api";

type SignupForm = {
  firstName: string;
  middleInitial: string;
  lastName: string;
  extensionName: string;
  birthDate: string;
  birthPlace: string;
  email: string;
  contactNumber: string;
  city: string;
  province: string;
  barangay: string;
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
  birthPlace: "",
  email: "",
  contactNumber: "",
  city: "",
  province: "",
  barangay: "",
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

export default function Signup() {
  const { height, width } = useWindowDimensions();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthDateValue, setBirthDateValue] = useState(new Date(2000, 0, 1));
  const [webDateInput, setWebDateInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const stepTitle = useMemo(() => {
    if (step === 1) {
      return "Personal Information";
    }

    if (step === 2) {
      return "Contact Information";
    }

    return "Account Security";
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
      } else if (!isValidISODate(form.birthDate)) {
        nextErrors.birthDate = "Enter a valid birth date.";
      }
      if (!form.birthPlace.trim()) nextErrors.birthPlace = "Birth place is required.";
    }

    if (targetStep === 2) {
      const email = form.email.trim().toLowerCase();

      if (!email) {
        nextErrors.email = "Email address is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nextErrors.email = "Enter a valid email address.";
      }

      if (!form.contactNumber.trim()) nextErrors.contactNumber = "Contact number is required.";
      if (!form.city.trim()) nextErrors.city = "City is required.";
      if (!form.province.trim()) nextErrors.province = "Province is required.";
      if (!form.barangay.trim()) nextErrors.barangay = "Barangay is required.";
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
        birthPlace: form.birthPlace.trim(),
        email: form.email.trim().toLowerCase(),
        contactNumber: form.contactNumber.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        barangay: form.barangay.trim(),
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

  const renderField = (
    field: FieldName,
    label: string,
    placeholder: string,
    icon: keyof typeof Ionicons.glyphMap,
    options?: {
      autoCapitalize?: "none" | "sentences" | "words" | "characters";
      keyboardType?: "default" | "email-address" | "phone-pad";
    },
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, errors[field] && styles.inputError]}>
        <Ionicons color="#667085" name={icon} size={19} style={styles.fieldIcon} />
        <TextInput
          autoCapitalize={options?.autoCapitalize}
          keyboardType={options?.keyboardType}
          onChangeText={(value) => updateField(field, value)}
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
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, errors[field] && styles.inputError]}>
        <Ionicons color="#667085" name="lock-closed-outline" size={19} style={styles.fieldIcon} />
        <TextInput
          onChangeText={(value) => updateField(field, value)}
          placeholder={placeholder}
          placeholderTextColor="#8a94a6"
          secureTextEntry={!visible}
          style={styles.input}
          value={form[field]}
        />
        <Pressable accessibilityLabel={visible ? "Hide password" : "Show password"} onPress={onToggle}>
          <Ionicons color="#111827" name={visible ? "eye-off-outline" : "eye-outline"} size={21} />
        </Pressable>
      </View>
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

  const renderDateField = () => (
    <View style={styles.field}>
      <Text style={styles.label}>Birth Date</Text>
      {Platform.OS === "web" ? (
        <View style={[styles.inputShell, errors.birthDate && styles.inputError]}>
          <Ionicons color="#667085" name="calendar-outline" size={19} style={styles.fieldIcon} />
          <TextInput
            onChangeText={handleWebDateChange}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#8a94a6"
            style={styles.input}
            value={webDateInput}
          />
        </View>
      ) : (
        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={[styles.inputShell, errors.birthDate && styles.inputError]}
        >
          <Ionicons color="#667085" name="calendar-outline" size={19} style={styles.fieldIcon} />
          <Text style={[styles.dateText, !form.birthDate && styles.placeholderText]}>
            {form.birthDate || "Select birth date"}
          </Text>
        </Pressable>
      )}
      {errors.birthDate ? <Text style={styles.errorText}>{errors.birthDate}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
        source={require("../assets/images/corousel11.png")}
        style={[styles.background, { height, width }]}
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.card}>
                <Text style={styles.eyebrow}>Step {step} of 3</Text>
                <Text style={styles.title}>{stepTitle}</Text>

                {step === 1 ? (
                  <View style={styles.fields}>
                    {renderField("firstName", "Firstname", "Enter firstname", "person-outline")}
                    {renderField("middleInitial", "Middle Initial", "Optional", "text-outline")}
                    {renderField("lastName", "Lastname", "Enter lastname", "person-outline")}
                    {renderField("extensionName", "Extension Name", "Optional", "ribbon-outline")}
                    {renderDateField()}
                    {renderField("birthPlace", "Birth Place", "Province, City", "location-outline")}
                  </View>
                ) : null}

                {step === 2 ? (
                  <View style={styles.fields}>
                    {renderField("email", "Email Address", "Enter email address", "mail-outline", {
                      autoCapitalize: "none",
                      keyboardType: "email-address",
                    })}
                    {renderField("contactNumber", "Contact Number", "Enter contact number", "call-outline", {
                      keyboardType: "phone-pad",
                    })}
                    {renderField("city", "City", "Enter city", "business-outline")}
                    {renderField("province", "Province", "Enter province", "map-outline")}
                    {renderField("barangay", "Barangay", "Enter barangay", "home-outline")}
                    {renderField("country", "Country", "Enter country", "earth-outline")}
                  </View>
                ) : null}

                {step === 3 ? (
                  <View style={styles.fields}>
                    {renderField("username", "Username", "Choose username", "at-outline", {
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

                {formError ? <Text style={styles.formError}>{formError}</Text> : null}

                <View style={styles.actions}>
                  {step > 1 ? (
                    <Pressable
                      disabled={isSaving}
                      onPress={() => setStep((currentStep) => currentStep - 1)}
                      style={styles.secondaryButton}
                    >
                      <Text style={styles.secondaryButtonText}>Back</Text>
                    </Pressable>
                  ) : null}
                  <Pressable
                    disabled={isSaving}
                    onPress={step === 3 ? handleSubmit : handleNext}
                    style={[styles.primaryButton, isSaving && styles.disabledButton]}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#ffffff" />
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
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>

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
              display="spinner"
              maximumDate={new Date()}
              mode="date"
              onChange={handleDatePickerChange}
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
  container: {
    backgroundColor: "#111827",
    flex: 1,
  },
  background: {
    backgroundColor: "#111827",
    flex: 1,
  },
  backgroundImage: {
    backgroundColor: "#111827",
    height: "100%",
    width: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11, 18, 32, 0.48)",
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 26,
  },
  card: {
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.24)",
    maxWidth: 560,
    padding: 18,
    width: "100%",
  },
  eyebrow: {
    color: "#475467",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  title: {
    color: "#111827",
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 32,
    marginBottom: 16,
  },
  fields: {
    gap: 10,
  },
  field: {
    gap: 5,
  },
  label: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
  },
  inputShell: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d0d5dd",
    borderRadius: 8,
    borderWidth: 1.3,
    flexDirection: "row",
    minHeight: 46,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  fieldIcon: {
    marginRight: 9,
  },
  input: {
    color: "#111827",
    flex: 1,
    fontSize: 15,
    minHeight: 44,
    padding: 0,
  },
  dateText: {
    color: "#111827",
    flex: 1,
    fontSize: 15,
  },
  placeholderText: {
    color: "#8a94a6",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  formError: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 12,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#111827",
    borderRadius: 8,
    borderWidth: 1.3,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.72,
  },
  loginLink: {
    alignItems: "center",
    marginTop: 14,
  },
  loginText: {
    color: "#475467",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  loginStrong: {
    color: "#111827",
    fontWeight: "800",
  },
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
