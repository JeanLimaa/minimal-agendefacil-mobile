import React, { useMemo, useState, useEffect } from "react";
import { View, ScrollView, Text } from "react-native";
import { Button, Dialog, Portal, Divider } from "react-native-paper";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { appointmentFormStyle as styles } from "../styles/styles";
import { ClientSelector } from "../components/AppointmentForm/ClientSelector";
import { DatePicker, DateTimeSelector, TimePicker } from "../components/AppointmentForm/DateTimeSelector";
import { ServiceSelector } from "../components/AppointmentForm/ServiceSelector";
import { SummaryShow } from "../components/AppointmentForm/SummaryShow";

import { useServices } from "../../../shared/hooks/queries/useServices";
import { useAppointmentEdit } from "../hooks/useAppointmentEdit";

import api from "@/shared/services/apiService";
import { Client } from "@/shared/types/client.interface";
import { Loading } from "@/shared/components/Loading";
import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";
import { format } from "date-fns";
import Toast from "react-native-toast-message";
import { AppBarHeader } from "@/shared/components/AppBarHeader";

export function AppointmentForm({ appointmentEditId }: { appointmentEditId?: string }) {
  const queryClient = useQueryClient();
  const apiErrorHandler = useApiErrorHandler();

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client>();
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [discount, setDiscount] = useState(0);
  const [inputWidth, setInputWidth] = useState(0);
  const [showDialog, setShowDialog] = useState(false);

  // Requisições
  const { data: servicesData, isLoading: isLoadingServices } = useServices(true);
  const { data: editItemData, isLoading: isLoadingEdit } = useAppointmentEdit(appointmentEditId);
  
  const services = servicesData || [];

  // Valores calculados
  const subTotalPrice = useMemo(() => {
    return services
      .filter(service => selectedServices.includes(service.id))
      .reduce((acc, curr) => acc + curr.price, 0);
  }, [selectedServices, services]);

  const totalPrice = Math.max(subTotalPrice - discount, 0);

  useEffect(() => {
    if (editItemData) {
      setSelectedServices(editItemData.appointmentService?.map(s => s.serviceId) || []);
      setSelectedClient(editItemData.client);
      setDate(format(editItemData.date, 'yyyy-MM-dd'));
      setTime(new Date(editItemData.date));
      setDiscount(editItemData.discount || 0);
    }
  }, [editItemData]);

  const handleSave = async () => {
    if (!date || !time || !selectedClient || selectedServices.length === 0) {
      setShowDialog(true);
      return;
    }

    try {
      const payload = {
        serviceIds: selectedServices,
        date: `${date}T${time.toISOString().split('T')[1]}`,
        clientId: selectedClient.id,
        discount,
      };

      if (appointmentEditId) {
        await api.put(`/appointment/admin/${appointmentEditId}`, payload);
      } else {
        await api.post(`/appointment/admin`, payload);
      }

      Toast.show({
        type: 'success',
        text1: appointmentEditId ? 'Agendamento atualizado com sucesso!' : 'Agendamento criado com sucesso!',
        text2: 'O agendamento foi salvo com sucesso.',
        swipeable: true,
        position: 'bottom',
      })

      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      router.back();
    } catch (error) {
        apiErrorHandler(error);
    }
  };

  if (isLoadingServices || (appointmentEditId && isLoadingEdit)) return <Loading />;
  
  return (
    <View style={styles.container}>
      <AppBarHeader message="Novo agendamento" />

      <ScrollView contentContainerStyle={styles.content}>
        <ClientSelector
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          inputWidth={inputWidth}
          setInputWidth={setInputWidth}
        />

        <DateTimeSelector
          date={date}
          time={time}
          setShowDatePicker={setShowDatePicker}
          setShowTimePicker={setShowTimePicker}
        />

        <ServiceSelector
          services={services}
          selectedServices={selectedServices}
          setSelectedServices={setSelectedServices}
        />

        <Divider />

        <SummaryShow
          subTotalPrice={subTotalPrice}
          totalPrice={totalPrice}
          discount={discount}
          setDiscount={setDiscount}
        />

        <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
          Salvar
        </Button>
      </ScrollView>

      <DatePicker
        date={date}
        setDate={setDate}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
      />

      <TimePicker
        time={time}
        setTime={setTime}
        showTimePicker={showTimePicker}
        setShowTimePicker={setShowTimePicker}
      />

      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Atenção</Dialog.Title>
          <Dialog.Content>
            <Text>Preencha todos os campos obrigatórios!</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
