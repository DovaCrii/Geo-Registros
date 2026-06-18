import { FlightPlanWizardForm } from "@/modules/flight-plans/flight-plan-wizard-form";

type Option = {
  id: string;
  label: string;
};

type FlightPlanFormValues = {
  code: string;
  title: string;
  operationDate: string;
  notes: string;
  geometryPayload: string;
  costCenterId: string;
  clientId: string;
  droneId: string;
  operatorId: string;
};

export function FlightPlanForm({
  title,
  description,
  action,
  submitLabel,
  initialValues,
  costCenterOptions,
  clientOptions,
  droneOptions,
  operatorOptions,
  geometrySummary,
}: {
  title: string;
  description: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  initialValues: FlightPlanFormValues;
  costCenterOptions: Option[];
  clientOptions: Option[];
  droneOptions: Option[];
  operatorOptions: Option[];
  geometrySummary?: string;
}) {
  return (
    <FlightPlanWizardForm
      title={title}
      description={description}
      action={action}
      submitLabel={submitLabel}
      initialValues={initialValues}
      costCenterOptions={costCenterOptions}
      clientOptions={clientOptions}
      droneOptions={droneOptions}
      operatorOptions={operatorOptions}
      geometrySummary={geometrySummary}
    />
  );
}
