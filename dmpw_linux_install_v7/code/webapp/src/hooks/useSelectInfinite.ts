import { useRef, useState } from 'react';
import { useSelect } from '@refinedev/antd';
import { BaseRecord, UseSelectProps } from '@refinedev/core';
import { SelectProps } from 'antd';
import { mergeOptions } from '@lib/utils';

type UseSelectInfiniteProps<TData extends BaseRecord = BaseRecord> = UseSelectProps<TData, any, TData>;

type UseSelectInfiniteReturn<TData extends BaseRecord = BaseRecord> = ReturnType<
  typeof useSelect<TData, any, TData>
> & {
  selectProps: SelectProps & {
    onPopupScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  };
};

export const useSelectInfinite = <TData extends BaseRecord = BaseRecord>(
  props: UseSelectInfiniteProps<TData>,
): UseSelectInfiniteReturn<TData> => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<SelectProps['options']>([]);

  const hasMore = useRef(true);

  const pageSize = props.pagination?.pageSize ?? 20;

  const useSelectReturn = useSelect<TData, any, TData>({
    ...props,
    pagination: { current: page, pageSize, mode: 'server' },

    queryOptions: {
      ...props.queryOptions,
      keepPreviousData: true,
      onSuccess(data) {
        if (!data.data?.length) {
          hasMore.current = false;
        }
        const normalizedData = data.data?.map((item) => ({
          label: item[props.optionLabel as keyof TData] || 'name',
          value: item[props.optionValue as keyof TData] || 'id',
        }));

        setOptions((prev) => mergeOptions(prev, normalizedData));
      },
    },

    onSearch: (value) => {
      setPage(1);
      setOptions([]);
      hasMore.current = true;
      setSearch(value);

      return [
        {
          field: 'search',
          operator: 'eq',
          value,
        },
      ];
    },
  });

  return {
    ...useSelectReturn,
    selectProps: {
      ...useSelectReturn.selectProps,
      options,
      onPopupScroll: (event) => {
        const target = event.currentTarget;

        if (target.scrollTop === 0 || useSelectReturn.query.isFetching) return;

        // Load more when user scrolls to 80% of the list
        if (target.scrollTop + target.offsetHeight >= target.scrollHeight * 0.8) {
          // Check if there are more options to load and not already loading
          if (useSelectReturn.selectProps.options && hasMore.current) {
            setPage((curr) => curr + 1);
          }
        }
      },
      loading: useSelectReturn.query.isFetching,
    },
  };
};
