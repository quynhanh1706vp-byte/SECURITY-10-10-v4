import { FormProps } from 'antd';

export type CustomFormProps<TValues = any> = Omit<FormProps<TValues>, 'children'> & {
  formActionType?: 'create' | 'edit';
};
