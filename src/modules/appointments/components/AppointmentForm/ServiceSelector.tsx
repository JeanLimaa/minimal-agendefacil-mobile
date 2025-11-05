import { View, Text } from "react-native";
import { Checkbox, Divider } from "react-native-paper";
import { appointmentFormStyle as styles } from "../../styles/styles";
import { Service } from "@/shared/types/service.interface";
import { formatToCurrency } from "@/shared/helpers/formatValue.helper";

interface Props {
  services: Service[];
  selectedServices: number[];
  setSelectedServices: (services: number[] | ((prev: number[]) => number[])) => void;
}

export function ServiceSelector({
  services,
  selectedServices,
  setSelectedServices,
}: Props) {
  const toggleService = (serviceId: number) => {
    setSelectedServices((prev: number[]) =>
      prev.includes(serviceId)
        ? prev.filter((id: number) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionLabel}>Serviços</Text>

      {/* Lista de Serviços */}
      {services.length === 0 ? (
        <Text style={styles.mediumLabel}>Nenhum serviço encontrado</Text>
      ) : (
        services.map(service => {
          const isSelected = selectedServices.includes(service.id);

          return (
            <View key={service.id}>
              <View style={[
                styles.serviceItem,
                isSelected && styles.selectedServiceItem
              ]}>
                <Checkbox
                  status={isSelected ? 'checked' : 'unchecked'}
                  onPress={() => toggleService(service.id)}
                />
                <View style={styles.serviceInfo}>
                  <Text>{service.name}</Text>
                  <Text>{formatToCurrency(service.price)}</Text>
                </View>
              </View>
              <Divider />
            </View>
          );
        })
      )}
    </View>
  );
}
