import { useQuery } from '@tanstack/react-query';
import api from '@/shared/services/apiService';
import { Service } from '@/shared/types/service.interface';

export const servicesQueryKey = 'services';
export const serviceByIdQueryKey: (id: number | null) => [string, number] = (id: number | null) => ['service', id || 0];

export function useServices(enabled: boolean = true) {
  return useQuery<Service[]>({
    queryKey: [servicesQueryKey],
    queryFn: async () => {
      const response = await api.get<Service[]>('/services');
      return response.data;
    },
    enabled,
  });
}

export function useServiceById(id: number | null) {
  return useQuery<Service>({
    queryKey: serviceByIdQueryKey(id),
    enabled: !!id,
    queryFn: async () => {
      const response = await api.get(`/services/${id}`);
      return response.data;
    },
  });
}
