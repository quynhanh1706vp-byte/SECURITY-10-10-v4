import { useCallback, useState } from 'react';
import { useTable, useTableProps, useTableReturnType } from '@refinedev/antd';
import { BaseKey, BaseRecord, HttpError, useTranslate } from '@refinedev/core';
import { TableProps } from 'antd';
import { useDebounceCallback } from 'usehooks-ts';

type UseCustomTableReturnType<
  TData extends BaseRecord,
  TError extends HttpError = HttpError,
  TSearchVariables = unknown,
> = useTableReturnType<TData, TError, TSearchVariables> & {
  selectedRowKeys: BaseKey[];
  handleSearch: (ev: any) => void;
  handleDeleteSuccess: (ids: BaseKey | BaseKey[]) => void;
  setSelectedRowKeys: (selectedRowKeys: BaseKey[]) => void;
  /**
   * Resets the table state, clearing selected rows and filters, and resetting to the first page.
   */
  resetTable: () => void;
};

type UseCustomTableProps = {
  searchFieldName?: string;
};

/**
 * Custom hook for managing table state and operations in an Ant Design table.
 *
 * It extends the functionality of the `useTable` hook from `@refinedev/antd`.
 *
 * It includes `row selection`, `search handling with debouncing`, and `delete success handling`.
 * @param useTableProps - The properties to be passed to the `useTable` hook.
 * @param options - The properties to be used for custom table.
 * @returns
 */
export const useCustomTable = <
  TQueryFnData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
  TSearchVariables = unknown,
  TData extends BaseRecord = TQueryFnData,
>(
  useTableProps: useTableProps<TQueryFnData, TError, TSearchVariables, TData>,
  options?: UseCustomTableProps,
): UseCustomTableReturnType<TData, TError, TSearchVariables> => {
  const t = useTranslate();
  const tableResult = useTable<TQueryFnData, TError, TSearchVariables, TData>(useTableProps);
  const { tableProps, current, setCurrent, setFilters: originalSetFilters } = tableResult;

  // Wrap setFilters to always reset to page 1 when filters change
  const setFilters: typeof originalSetFilters = ((filters: any, behavior?: any) => {
    // Reset to page 1 when applying new filters
    setCurrent(1);

    // Handle both overload signatures
    if (typeof filters === 'function') {
      // When filters is a setter function
      return originalSetFilters(filters);
    } else {
      // When filters is an array
      return originalSetFilters(filters, behavior);
    }
  }) as typeof originalSetFilters;

  const { dataSource, pagination } = tableProps;

  const [selectedRowKeys, setSelectedRowKeys] = useState<BaseKey[]>([]);
  const rowSelection: TableProps<TData>['rowSelection'] = {
    selectedRowKeys,
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys as string[]);
    },
    preserveSelectedRowKeys: true, // Keep selected rows even after pagination changes
  };

  /**
   * Handles the search input change with debouncing.
   */
  const handleSearch = useDebounceCallback((ev: any) => {
    if (!ev) return;

    // Reset to first page when searching
    setCurrent(1);

    setFilters([
      {
        field: options?.searchFieldName || 'search',
        operator: 'eq',
        value: ev.target.value,
      },
    ]);
  }, 500);

  /**
   *  Handles the success of a delete operation.
   *
   *  - Update the current page if the deleted items were the last on the current page,
   *  - Update the selected row keys if row selection is enabled.
   * @param ids - Single ID or an array of IDs.
   */
  const handleDeleteSuccess = useCallback(
    (ids: BaseKey | BaseKey[]) => {
      ids = typeof ids === 'string' || typeof ids === 'number' ? [ids] : ids;

      if (pagination && dataSource?.length === ids.length && current > 1) {
        setCurrent(current - 1);
      }

      if (rowSelection) {
        const selectedRowKeys = (rowSelection.selectedRowKeys || []) as BaseKey[];

        const newSelectedRowKeys = selectedRowKeys.filter((key) => !(ids as BaseKey[]).includes(key));
        setSelectedRowKeys(newSelectedRowKeys);
      }
    },
    [pagination, dataSource, current, rowSelection, setSelectedRowKeys],
  );

  const resetTable = () => {
    setSelectedRowKeys([]);
    setCurrent(1);
    setFilters([], 'replace');
  };

  return {
    ...tableResult,
    setFilters, // Override with wrapped version that resets to page 1
    tableProps: {
      ...tableProps,
      rowKey: 'id',
      // size: 'middle',
      rowSelection,
      pagination: {
        ...pagination,
        // hideOnSinglePage: true,
        itemRender: undefined, // Disable pagination link rendering from useTable hook
        showTotal: (total, range) => t('pagination.showTotal', { from: range[0], to: range[1], total }),
        showSizeChanger: true,
      },
      scroll: { scrollToFirstRowOnChange: true },
    },
    selectedRowKeys,
    handleSearch,
    handleDeleteSuccess,
    setSelectedRowKeys,
    resetTable,
  };
};
