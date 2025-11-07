import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { Checkbox, Menu, TextInput, Button } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSettingsTabs } from "../contexts/SettingTabsContext";
import WeeklyScheduleField from "@/shared/components/WeeklyScheduleField";
import { formatToCurrency } from "@/shared/helpers/formatValue.helper";
import { CompanyWorkingHours } from "@/shared/types/company.types";

export type FieldValue =
  | string
  | number
  | boolean
  | Date
  | null
  | object
  | Array<any>;
export type FormDataType = Record<string, any>;

export interface GenericFormField {
  name: string;
  label: string;
  type:
    | "switch"
    | "text"
    | "number"
    | "email"
    | "tel"
    | "date"
    | "select"
    | "checkbox"
    | "text-area"
    | "header"
    | "weekly-schedule"
    | "informativeMessage"
    | "currency"
    | "switchList";
  placeholder?: string;
  options?: { label: string; value: string | boolean | number }[];
  onChange?: (value: FieldValue, allValues: FormDataType) => void;
  required?: boolean;

  weeklyScheduleProps?: {
    companyWorkingHours?: CompanyWorkingHours;
    type: "company";
    useModal?: boolean;
    modalTitle?: string;
    modalSubtitle?: string;
  };
}

interface GenericFormProps {
  fields: GenericFormField[];
  tabKey: string;
  initialValues?: FormDataType;
  onChange?: (data: FormDataType) => void;
}

export type GenericFormRef = {
  getData: () => FormDataType;
};

export const GenericForm = ({
  fields,
  initialValues,
  onChange,
  tabKey,
}: GenericFormProps) => {
  const [formData, setFormData] = useState<FormDataType>({});
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const { setTabData } = useSettingsTabs();
  const didInitialize = useRef(false);

  useEffect(() => {
    if (initialValues && !didInitialize.current) {
      setFormData(initialValues);
      didInitialize.current = true;
    }
  }, [initialValues]);

  useEffect(() => {
    if (setTabData) {
      setTabData(tabKey, formData);
    }
  }, [formData, tabKey]);

  const handleChange = (name: string, value: FieldValue) => {
    const fieldObj = fields.find((field) => field.name === name);
    let parsedValue: FieldValue = value;

    if (fieldObj?.type === "number" && typeof value === "string") {
      const onlyNumbers = value.replace(/[^0-9]/g, "");
      parsedValue = Number(onlyNumbers);
      if (isNaN(parsedValue)) parsedValue = 0;
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: parsedValue };

      if (fieldObj && typeof fieldObj.onChange === "function") {
        fieldObj.onChange(value, updated);
      }
      if (onChange) onChange(updated);

      return updated;
    });
  };

  const mainColor = "#CF7486";
  const secondaryColor = "#FFD2DE";

  return (
    <View style={{ gap: 20 }}>
      {fields.map((field) => {
        const fieldLabel = field.required ? `${field.label} *` : field.label;

        if (field.type === "date") {
          const [showDatePicker, setShowDatePicker] = useState(false);
          const currentValue = formData[field.name] || new Date();

          return (
            <View key={field.name}>
              <Text style={styles.label}>{fieldLabel}</Text>
              <Button
                onPress={() => setShowDatePicker(true)}
                mode="outlined"
                textColor={mainColor}
              >
                {formData[field.name]
                  ? new Date(
                      formData[field.name] as string | Date
                    ).toLocaleDateString()
                  : "Selecionar data"}
              </Button>

              {showDatePicker && (
                <DateTimePicker
                  value={new Date(currentValue as string | Date)}
                  onChange={(_, date) => {
                    setShowDatePicker(false);
                    if (date) handleChange(field.name, date);
                  }}
                  mode="date"
                />
              )}
            </View>
          );
        }

        if (field.type === "checkbox") {
          return (
            <View key={field.name} style={styles.checkboxContainer}>
              <View style={styles.checkBoxContainerRow}>
                <Checkbox
                  status={formData[field.name] ? "checked" : "unchecked"}
                  onPress={() =>
                    handleChange(field.name, !formData[field.name])
                  }
                  color={mainColor}
                />
                <Text style={styles.checkboxLabel}>{fieldLabel}</Text>
              </View>

              <Text style={styles.placeholderLabel}>{field.placeholder}</Text>
            </View>
          );
        }

        if (field.type === "select" && field.options) {
          return (
            <View key={field.name}>
              <Text>{fieldLabel}</Text>
              <Menu
                visible={menuVisible === field.name}
                onDismiss={() => setMenuVisible(null)}
                anchor={
                  <Button
                    mode="outlined"
                    textColor={mainColor}
                    onPress={() => setMenuVisible(field.name)}
                    style={{ justifyContent: "flex-start" }}
                  >
                    {formData[field.name]
                      ? field.options.find(
                          (opt) => opt.value === formData[field.name]
                        )?.label
                      : "Selecione"}
                  </Button>
                }
              >
                {field.options.map((option) => (
                  <Menu.Item
                    key={String(option.value)}
                    onPress={() => {
                      handleChange(field.name, option.value);
                      setMenuVisible(null);
                    }}
                    title={option.label}
                  />
                ))}
              </Menu>
            </View>
          );
        }

        if (field.type === "header") {
          return (
            <Text
              key={field.name}
              style={[styles.header, { color: mainColor }]}
            >
              {fieldLabel}
            </Text>
          );
        }

        if (field.type === "informativeMessage") {
          return (
            <Text key={field.name} style={styles.informativeMessage}>
              {fieldLabel}
            </Text>
          );
        }

        if (field.type === "weekly-schedule") {
          return (
            <WeeklyScheduleField
              key={field.name}
              fieldLabel={fieldLabel}
              field={field}
              formData={formData}
              handleChange={handleChange}
              useModal={field?.weeklyScheduleProps?.useModal}
              modalTitle={field?.weeklyScheduleProps?.modalTitle}
              modalSubtitle={field?.weeklyScheduleProps?.modalSubtitle}
              companyWorkingHours={
                field?.weeklyScheduleProps?.companyWorkingHours
              }
              type={field?.weeklyScheduleProps?.type ?? "company"}
            />
          );
        }

        if (field.type === "currency") {
          const formatCurrency = (value: number): string => {
            return formatToCurrency(value);
          };
          const parseCurrency = (text: string): number => {
            const onlyNumbers = text.replace(/\D/g, "");
            return onlyNumbers ? parseFloat(onlyNumbers) / 100 : 0;
          };

          return (
            <View key={field.name}>
              <TextInput
                label={fieldLabel}
                style={[
                  styles.input,
                  { borderColor: mainColor },
                  field.name === "serviceInterval" && {
                    backgroundColor: secondaryColor,
                  },
                ]}
                outlineColor={mainColor}
                activeOutlineColor={mainColor}
                value={
                  formData[field.name] !== undefined &&
                  formData[field.name] !== null
                    ? formatCurrency(Number(formData[field.name]))
                    : ""
                }
                onChangeText={(text) =>
                  handleChange(field.name, parseCurrency(text))
                }
                keyboardType="numeric"
              />
            </View>
          );
        }

        if (field.type === "switch") {
          return (
            <View key={field.name}>
              <Text>{fieldLabel}</Text>
              <Switch
                value={formData[field.name] || false}
                onValueChange={(value) => handleChange(field.name, value)}
                trackColor={{ true: secondaryColor, false: "#ccc" }}
                thumbColor={mainColor}
              />
            </View>
          );
        }

        if (field.type === "switchList") {
          return (
            <View key={field.name} style={{ gap: 10 }}>
              {field.options?.map((data, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.label}>{data.label}</Text>
                  <Switch
                    value={typeof data.value === "boolean" ? data.value : false}
                    onValueChange={(value) => {
                      const updated = [...formData[field.name]];
                      updated[index] = { ...data, value };
                      handleChange(field.name, updated);
                    }}
                    trackColor={{ true: secondaryColor, false: "#ccc" }}
                    thumbColor={mainColor}
                  />
                </View>
              ))}
            </View>
          );
        }

        return (
          <View key={field.name}>
            <TextInput
              label={fieldLabel}
              style={[
                styles.input,
                { borderColor: mainColor },
                field.name === "serviceInterval" && {
                  backgroundColor: secondaryColor,
                },
              ]}
              outlineColor={mainColor}
              activeOutlineColor={mainColor}
              value={formData[field.name]?.toString() || ""}
              onChangeText={(text) => handleChange(field.name, text)}
              keyboardType={
                field.type === "email"
                  ? "email-address"
                  : field.type === "tel"
                  ? "phone-pad"
                  : field.type === "number"
                  ? "numeric"
                  : "default"
              }
              multiline={field.type === "text-area"}
              numberOfLines={field.type === "text-area" ? 4 : 1}
            />
            {field.placeholder && (
              <Text style={styles.placeholderLabel}>{field.placeholder}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    padding: 0.5,
    borderRadius: 8,
  },
  checkboxContainer: {
    backgroundColor: "#FFD2DE",
    padding: 10,
    borderRadius: 8,
    borderColor: "#CF7486",
    borderWidth: 1,
    gap: 5,
  },
  checkBoxContainerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    fontSize: 16,
  },
  placeholderLabel: {
    fontSize: 12,
    color: "#555",
    marginLeft: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  informativeMessage: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
});
