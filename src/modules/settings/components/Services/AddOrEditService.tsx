import { SettingsTabs } from "../../SettingsTabsLayout";
import { GenericForm } from "../GenericForm";
import { useRoute } from "@react-navigation/native";
import { servicesQueryKey, serviceByIdQueryKey, useServiceById } from "@/shared/hooks/queries/useServices";
import { Loading } from "@/shared/components/Loading";
import ErrorScreen from "@/app/ErrorScreen";

export const addOrEditServicesKeys = ["details", "pricing"] as const;

export function AddOrEditService() {
    const route = useRoute();
    const { serviceId } = route.params as { serviceId: number | null };

    const { data: serviceData, error: serviceError, isLoading: serviceLoading, refetch: serviceRefetch } = useServiceById(serviceId);

    if (serviceLoading) {
        return <Loading />;
    }

    if (serviceError) {
        return <ErrorScreen onRetry={serviceRefetch} />;
    }

    return (
        <SettingsTabs
            headerTitle={serviceData?.name || "Novo serviço"}
            endpoint={serviceId ? `services/${serviceId}` : "services"}
            method={serviceId ? "PUT" : "POST"}
            tabs={[
                {
                    key: addOrEditServicesKeys[0],
                    title: "Serviço",
                    tanstackCacheKeys: [
                        servicesQueryKey,
                        serviceByIdQueryKey(serviceId)
                    ],
                    content:
                        <GenericForm
                            tabKey={addOrEditServicesKeys[0]}
                            fields={[
                                { name: "name", label: "Nome", type: "text", required: true },
                                { name: "duration", label: "Duração do serviço", type: "number", placeholder: "Duração em minutos", required: true },
                                { name: "description", label: "Descrição", type: "text" },
                            ]}
                            initialValues={serviceData || {}}
                        />
                },
                {
                    key: addOrEditServicesKeys[1],
                    title: "Preço",
                    tanstackCacheKeys: [
                        servicesQueryKey,
                        serviceByIdQueryKey(serviceId)
                    ],
                    content:
                        <GenericForm
                            tabKey={addOrEditServicesKeys[1]}
                            fields={[
                                { name: "price", label: "Preço", type: "currency", required: true }
                            ]}
                            initialValues={serviceData ? serviceData : { price: 0 }}
                        />
                }
            ]}
        />
    )
}