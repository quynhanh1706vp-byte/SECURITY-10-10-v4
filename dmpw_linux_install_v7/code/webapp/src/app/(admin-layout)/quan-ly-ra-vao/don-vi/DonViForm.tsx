import { useMemo } from 'react';
import { useTree } from '@hooks';
import { useTranslation } from '@refinedev/core';
import { Form, FormProps, Input, Select, TreeSelect } from 'antd';
import { getTimeZones } from '@vvo/tzdb';

const { Item: FormItem } = Form;

interface DonViFormProps extends Omit<FormProps, 'children'> {
  currentRecordId?: string | number;
}

export default function PhongBanForm({ currentRecordId: propsRecordId, ...formProps }: DonViFormProps) {
  const { translate: t } = useTranslation();
  const {
    query: { data: treeData, isFetching },
    handleSearch: handleSearchBuilding,
  } = useTree({
    resource: 'buildings/get-building-tree',
  });

  // Function to recursively filter out the current record and its descendants
  const filterTreeData = (treeData: any[], excludeId: string | number): any[] => {
    if (!excludeId) return treeData;

    return treeData
      .filter((node) => node.id !== excludeId)
      .map((node) => ({
        ...node,
        children: node.children ? filterTreeData(node.children, excludeId) : undefined,
      }));
  };

  // Filter tree data to exclude current record in edit mode
  const filteredTreeData = useMemo(() => {
    if (!propsRecordId || !treeData?.data) return treeData?.data || [];
    return filterTreeData(treeData.data, propsRecordId);
  }, [treeData?.data, propsRecordId]);

  const timezoneOptions = getTimeZones().map((tz) => ({
    label: tz.name,
    value: tz.name,
  }));
  return (
    <Form {...formProps} layout='vertical'>
      <div className='grid grid-cols-2 gap-6'>
        <FormItem
          label={t('quan-ly-ra-vao/don-vi.don-vi.form.name.label')}
          name='name'
          rules={[
            { required: true, whitespace: true, message: t('quan-ly-ra-vao/don-vi.don-vi.form.name.required') },
            {
              max: 50,
              message: t('validation.maxLength', { max: 50, field: t('quan-ly-ra-vao/don-vi.don-vi.form.name.label') }),
            },
          ]}
        >
          <Input placeholder={t('quan-ly-ra-vao/don-vi.don-vi.form.name.placeholder')} />
        </FormItem>

        <div>
          <FormItem label={t('quan-ly-ra-vao/don-vi.don-vi.form.parent.label')} name='parentId' className='mb-0'>
            <TreeSelect
              treeData={filteredTreeData}
              fieldNames={{ label: 'name', value: 'id' }}
              placeholder={t('quan-ly-ra-vao/don-vi.don-vi.form.parent.placeholder')}
              showSearch
              onSearch={handleSearchBuilding}
              filterTreeNode={false}
              styles={{
                popup: { root: { maxHeight: 400, overflow: 'auto' } },
              }}
              allowClear
              treeDefaultExpandAll
              loading={isFetching}
            />
          </FormItem>

          <div className='text-[12px] leading-[22px] text-[#00000073]'>
            {t('quan-ly-ra-vao/don-vi.don-vi.form.parent.note')}
          </div>
        </div>
      </div>

      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-12'>
          <FormItem
            label={t('quan-ly-ra-vao/don-vi.don-vi.form.address.label')}
            name='address'
            rules={[
              {
                max: 100,
                message: t('validation.maxLength', {
                  max: 100,
                  field: t('quan-ly-ra-vao/don-vi.don-vi.form.address.label'),
                }),
              },
            ]}
          >
            <Input placeholder={t('quan-ly-ra-vao/don-vi.don-vi.form.address.placeholder')} />
          </FormItem>
        </div>
      </div>

      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-12'>
          <FormItem label={t('quan-ly-ra-vao/don-vi.don-vi.form.timezone.label')} name='timeZone'>
            <Select
              options={timezoneOptions}
              showSearch
              placeholder={t('quan-ly-ra-vao/don-vi.don-vi.form.timezone.placeholder')}
              defaultValue='Asia/Ho_Chi_Minh'
            />
          </FormItem>
        </div>
      </div>
    </Form>
  );
}
