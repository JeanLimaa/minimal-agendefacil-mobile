import { Client } from "./client.interface";

export interface IAppointment {
  id: string;
  date: string;
  appointmentStatus: string;
  totalPrice: string;
  status: AppointmentStatus;
  clientId: number;
  companyId: number;
  duration: number;
  clientName: string;
  client: Client;
  discount?: number;
  subTotalPrice?: number;
}

export interface IAppointmentMapped {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  client: string;
  appointmentStatus: AppointmentStatus;
  totalPrice: string;
}

export enum AppointmentStatus {
  PENDING = "Pendente",
  COMPLETED = "Concluído",
  CONFIRMED = "Confirmado",
  CANCELED = "Cancelado",
}

export interface AppointmentEditResponse extends IAppointment {
  appointmentService: {
    appointmentId: number;
    serviceId: number;
    service: {
      id: number;
      name: string;
      duration: number;
      price: number;
    };
  }[];
}