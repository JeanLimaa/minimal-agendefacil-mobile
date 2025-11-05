import { useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import api from '@/shared/services/apiService';
import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';

interface VersionValidationResponse {
  isValid: boolean;
  isLatest: boolean;
  currentVersion: string;
  minRequiredVersion: string;
  userVersion: string;
  message: string;
  forceUpdate: boolean;
  optionalUpdate: boolean;
  downloadUrl?: string;
}

export const useVersionValidation = () => {
  const [hasShownAlert, setHasShownAlert] = useState(false);
  const currentVersion = Constants.expoConfig?.version || Constants.manifest?.version;
  const platform = Platform.OS;

  const { data, error, isLoading } = useQuery<VersionValidationResponse>({
    queryKey: ['version-validation', currentVersion],
    queryFn: async (): Promise<VersionValidationResponse> => {
      const response = await api.get(`/version/validate?version=${currentVersion}&platform=${platform}`);
      return response.data;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  
  useEffect(() => {
    if (data && !hasShownAlert) {
      handleVersionValidation(data);
    }
  }, [data, hasShownAlert]);

  const handleVersionValidation = (validationData: VersionValidationResponse) => {
    if (validationData.forceUpdate) {
      showForceUpdateAlert(validationData);
    } else if (validationData.optionalUpdate) {
      showOptionalUpdateAlert(validationData);
    }
    setHasShownAlert(true);
  };

  const showForceUpdateAlert = (validationData: VersionValidationResponse) => {
    Alert.alert(
      'Atualização Obrigatória',
      validationData.message,
      [
        {
          text: 'Atualizar Agora',
          onPress: () => openAppStore(validationData.downloadUrl),
        },
      ],
      { cancelable: false }
    );
  };

  const showOptionalUpdateAlert = (validationData: VersionValidationResponse) => {
    Alert.alert(
      'Atualização Disponível',
      validationData.message,
      [
        {
          text: 'Agora Não',
          style: 'cancel',
        },
        {
          text: 'Atualizar',
          onPress: () => openAppStore(validationData.downloadUrl),
        },
      ]
    );
  };

  const openAppStore = (downloadUrl?: string) => {
    if (downloadUrl) {
      Linking.openURL(downloadUrl).catch(() => {
        Alert.alert(
          'Erro',
          'Não foi possível abrir a loja de aplicativos. Por favor, atualize manualmente.'
        );
      });
    }
  };

  return {
    isLoading,
    error,
    validationData: data,
    isValid: data?.isValid ?? true,
    forceUpdate: data?.forceUpdate ?? false,
  };
};