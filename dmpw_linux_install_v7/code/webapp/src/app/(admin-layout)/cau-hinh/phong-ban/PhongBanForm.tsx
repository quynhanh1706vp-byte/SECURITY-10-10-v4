import { useTree } from '@hooks';
import { useSelect } from '@refinedev/antd';
import { useTranslation } from '@refinedev/core';
import { Form, FormProps, Input, InputNumber, Select, TreeSelect } from 'antd';

const { Item: FormItem } = Form;

export default function PhongBanForm(formProps: Omit<FormProps, 'children'>) {
  const { translate: t } = useTranslation();
  const { selectProps: managerSelectProps } = useSelect({
    resource: 'users',
    optionLabel: 'firstName',
    optionValue: 'id',
    filters: [
      {
        field: 'isValid',
        operator: 'eq',
        value: 0,
      },
    ],
    pagination: {
      pageSize: 25,
    },
    sorters: [
      {
        field: 'firstName',
        order: 'asc',
      },
    ],
    defaultValue: formProps.initialValues?.departmentManagerId || undefined,
    meta: {
      fetchSingle: true, // Use this if you want to fetch a single item for default option in Select
    },
    selectedOptionsOrder: 'selected-first',
    onSearch: (value) => [
      {
        field: 'search',
        operator: 'eq',
        value,
      },
    ],
    debounce: 500,
  });

  const {
    query: { data: treeData, isFetching },
    handleSearch: handleSearchDepartment,
  } = useTree({
    resource: 'departments/get-department-tree',
    pagination: {
      pageSize: 50,
    },
  });

  return (
    <Form {...formProps} layout='vertical'>
      <div className='grid grid-cols-2 gap-6'>
        <FormItem
          label={t('cau-hinh/departments.form.fields.code')}
          name='number'
          rules={[
            { required: true, whitespace: true, message: t('cau-hinh/departments.form.messages.requiredCode') },
            {
              max: 20,
              message: t('validation.maxLength', { max: 20, field: t('cau-hinh/departments.form.fields.code') }),
            },
          ]}
        >
          <Input placeholder={t('cau-hinh/departments.form.placeholders.code')} />
        </FormItem>

        <FormItem
          label={t('cau-hinh/departments.form.fields.name')}
          name='name'
          rules={[
            { required: true, whitespace: true, message: t('cau-hinh/departments.form.messages.requiredName') },
            {
              max: 100,
              message: t('validation.maxLength', { max: 100, field: t('cau-hinh/departments.form.fields.name') }),
            },
          ]}
        >
          <Input placeholder={t('cau-hinh/departments.form.placeholders.name')} />
        </FormItem>
      </div>

      <div className='grid grid-cols-2 gap-6'>
        <FormItem label={t('cau-hinh/departments.form.fields.manager')} name='departmentManagerId'>
          <Select {...managerSelectProps} placeholder={t('cau-hinh/departments.common.select')} allowClear />
        </FormItem>

        <div>
          <FormItem label={t('cau-hinh/departments.form.fields.parent')} name='parentId' className='mb-0.5!'>
            <TreeSelect
              treeData={treeData?.data || []}
              fieldNames={{ label: 'departmentName', value: 'id' }}
              placeholder={t('cau-hinh/departments.form.placeholders.parent')}
              showSearch
              onSearch={handleSearchDepartment}
              filterTreeNode={false}
              styles={{
                popup: { root: { maxHeight: 400, overflow: 'auto' } },
              }}
              allowClear
              treeDefaultExpandAll
              loading={isFetching}
            />
          </FormItem>

          <div className='text-black/45'>{t('cau-hinh/departments.form.tips.parentEmpty')}</div>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-6'>
        <div>
          <FormItem
            label={t('cau-hinh/departments.form.fields.percentOutside')}
            name='maxPercentCheckout'
            className='mb-0.5!'
          >
            <InputNumber min={0} max={100} placeholder={t('cau-hinh/departments.common.input')} className='w-full' />
          </FormItem>

          <div className='text-black/45'>{t('cau-hinh/departments.form.tips.percentOutsideEmpty')}</div>
        </div>

        <FormItem label={t('cau-hinh/departments.form.fields.maxEmployeesOutside')} name='maxNumberCheckout'>
          <InputNumber min={0} placeholder={t('cau-hinh/departments.common.input')} className='w-full' />
        </FormItem>
      </div>
    </Form>
  );
}
