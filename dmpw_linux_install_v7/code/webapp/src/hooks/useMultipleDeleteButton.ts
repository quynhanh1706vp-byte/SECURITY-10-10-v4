import {
  BaseKey,
  CanReturnType,
  DeleteManyResponse,
  useCan,
  useDeleteMany,
  useMutationMode,
  useResourceParams,
  useTranslate,
  useWarnAboutChange,
} from '@refinedev/core';
import { DeleteManyParams } from '@refinedev/core/dist/hooks/data/useDeleteMany';

export type DeleteButtonProps = {
  resource?: string;
  ids: BaseKey[];
  dataProviderName?: string;
  meta?: Record<string, unknown>;
  accessControl?: {
    enabled?: boolean;
    hideIfUnauthorized?: boolean;
  };
  onSuccess?: (value: DeleteManyResponse) => void;
} & Pick<DeleteManyParams<any, any, any>, 'mutationMode' | 'successNotification' | 'errorNotification' | 'invalidates'>;

export type DeleteButtonValues = {
  label: string;
  // title: string;
  // hidden: boolean;
  loading: boolean;
  disabled: boolean;
  // canAccess: CanReturnType | undefined;
  confirmOkLabel: string;
  cancelLabel: string;
  confirmTitle: string;
  onConfirm: () => void;
};

export function useMultipleDeleteButton(props: DeleteButtonProps): DeleteButtonValues {
  const translate = useTranslate();
  const { mutate, isLoading, variables } = useDeleteMany();
  const { setWarnWhen } = useWarnAboutChange();
  const { mutationMode } = useMutationMode(props.mutationMode);

  const { resource, identifier } = useResourceParams({
    resource: props.resource,
  });

  const { data: canAccess } = useCan({
    resource: resource?.name,
    action: 'delete',
    params: { resource },
  });

  const disabled = canAccess?.can === false;

  const label = translate('buttons.delete', 'Delete');

  const confirmOkLabel = translate('buttons.delete', 'Delete');

  const confirmTitle = translate('buttons.confirm', 'Are you sure?');

  const cancelLabel = translate('buttons.cancel', 'Cancel');

  const onConfirm = () => {
    if (identifier) {
      setWarnWhen(false);
      mutate(
        {
          ids: props.ids,
          resource: identifier,
          mutationMode,
          successNotification: props.successNotification,
          errorNotification: props.errorNotification,
          meta: props.meta,
          metaData: props.meta,
          dataProviderName: props.dataProviderName,
          invalidates: props.invalidates,
          values: variables?.values,
        },
        {
          onSuccess: props.onSuccess,
        },
      );
    }
  };

  return {
    label,
    // title,
    // hidden,
    disabled,
    // canAccess,
    loading: isLoading,
    confirmOkLabel,
    cancelLabel,
    confirmTitle,
    onConfirm,
  };
}
