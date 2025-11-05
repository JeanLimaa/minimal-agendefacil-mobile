import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useVersionValidation } from '@/shared/hooks/useVersionValidation';
import { Loading } from './Loading';
import { Button } from 'react-native-paper';
import { Colors } from '@/shared/constants/Colors';

export const VersionValidator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, error, isValid, forceUpdate } = useVersionValidation();

  // Se está carregando, mostra loading apenas por alguns segundos para não bloquear muito tempo
  if (isLoading) {
    return <Loading />;
  }

  // Se deu erro na validação, permite continuar (falha silenciosa)
  if (error) {
    console.warn('Erro ao validar versão do app:', error);
    return <>{children}</>;
  }

  // Se a versão é inválida e precisa de update forçado, bloqueia o app
  if (forceUpdate && !isValid) {
    return null; // Não renderiza nada, bloqueando o uso do app
  }

  // Se chegou até aqui, permite usar o app
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.mainColor,
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    backgroundColor: Colors.light.mainColor,
    paddingHorizontal: 20,
  },
});