import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, IconButton, } from 'react-native-paper';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { AppBarHeader } from '@/shared/components/AppBarHeader';
import { Loading } from '@/shared/components/Loading';
import { EmptyText } from '@/shared/components/EmptyText';
import api from '@/shared/services/apiService';
import { useApiErrorHandler } from '@/shared/hooks/useApiErrorHandler';
import { useConfirm } from '@/shared/hooks/useConfirm';
import { Colors } from '@/shared/constants/Colors';

interface Block {
    id: string;
    date: string;
    duration: number;
    notes: string | null;
    client: {
        name: string;
    };
}

export function BlockManagementScreen() {
    const queryClient = useQueryClient();
    const apiErrorHandler = useApiErrorHandler();
    const { confirm, ConfirmDialogComponent } = useConfirm();

    // Buscar bloqueios
    const { data: blocks, isLoading, refetch } = useQuery({
        queryKey: ['blocks'],
        queryFn: async () => {
            const response = await api.get<Block[]>('/appointment/blocks/company');
            return response.data;
        },
    });

    // Mutation para deletar bloqueio
    const deleteMutation = useMutation({
        mutationFn: async (blockId: string) => {
            await api.delete(`/appointment/block/${blockId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blocks'] });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            Toast.show({
                type: 'success',
                text1: 'Bloqueio removido',
                text2: 'O bloqueio foi removido com sucesso.',
                position: 'bottom',
            });
        },
        onError: (error) => {
            apiErrorHandler(error);
        },
    });

    const handleDeletePress = async (blockId: string) => {
        const confirmed = await confirm({
            title: 'Confirmar Exclusão',
            message: 'Tem certeza que deseja remover este bloqueio de horário?',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
        });
        
        if (confirmed) {
            deleteMutation.mutate(blockId);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) {
            return `${hours}h`;
        }
        return `${hours}h ${remainingMinutes}min`;
    };

    const getEndTime = (startDate: string, duration: number) => {
        const start = new Date(startDate);
        const end = new Date(start.getTime() + duration * 60000);
        return format(end, 'HH:mm', { locale: ptBR });
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <View style={styles.container}>
            <AppBarHeader message="Gerenciar Bloqueios" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                }
            >
                {!blocks || blocks.length === 0 ? (
                    <EmptyText>Nenhum bloqueio de horário cadastrado</EmptyText>
                ) : (
                    <View style={styles.blocksList}>
                        {blocks.map((block) => (
                            <Card key={block.id} style={styles.card}>
                                <Card.Content>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardInfo}>
                                            <Text style={styles.dateText}>
                                                {formatDateTime(block.date)}
                                            </Text>
                                            <Text style={styles.endTimeText}>
                                                Término: {getEndTime(block.date, block.duration)}
                                            </Text>
                                            <Text style={styles.durationText}>
                                                Duração total: {formatDuration(block.duration)}
                                            </Text>
                                        </View>
                                        <IconButton
                                            icon="delete"
                                            iconColor={Colors.light.error}
                                            size={24}
                                            onPress={() => handleDeletePress(block.id)}
                                            disabled={deleteMutation.isPending}
                                        />
                                    </View>
                                </Card.Content>
                            </Card>
                        ))}
                    </View>
                )}
            </ScrollView>

            {ConfirmDialogComponent}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EAEAEA',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 80,
    },
    blocksList: {
        gap: 12,
    },
    card: {
        marginBottom: 12,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardInfo: {
        flex: 1,
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.textTertiary,
        marginBottom: 4,
    },
    durationText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginBottom: 2,
    },
    endTimeText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginBottom: 4,
    },
});
