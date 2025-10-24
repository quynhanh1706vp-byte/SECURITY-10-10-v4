import { ChangeEvent, useEffect, useState } from 'react';
import { BaseKey, CrudFilters, useList } from '@refinedev/core';
import { TreeDataNode, TreeProps } from 'antd';
import { useDebounceCallback } from 'usehooks-ts';
import { DataNode } from 'antd/es/tree';

// Clone the type of props (parameters) for useList
type UseTreeProps = Parameters<typeof useList>[0] & {
  nodeLabel?: string;
  nodeValue?: string;
};

export const useTree = ({ pagination, nodeLabel, nodeValue, ...useListProps }: UseTreeProps) => {
  const [filters, setFilters] = useState<CrudFilters>([]);

  const [current, setCurrent] = useState(pagination?.current || 1);
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 20);

  useEffect(() => {
    const { current: newCurrent, pageSize: newPageSize } = pagination || {};

    if (newCurrent) {
      setCurrent(newCurrent);
    }
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  }, [pagination]);

  const query = useList({
    filters,
    pagination: {
      current,
      pageSize,
    },
    ...useListProps,
  });

  const [checkedKeys, setCheckedKeys] = useState<BaseKey[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<BaseKey[]>([]);

  /**
   * Handles the search input change with debouncing.
   */
  const handleSearch = useDebounceCallback((ev: ChangeEvent<HTMLInputElement> | string) => {
    setFilters([
      {
        field: 'search',
        operator: 'eq',
        value: typeof ev === 'string' ? ev : ev.target.value,
      },
    ]);
  }, 500);

  /**
   *  Handles the success of a delete operation.
   *
   *  - Update the current page if the deleted items were the last on the current page,
   *  - Update the selected row keys if row selection is enabled.
   * @param ids - Single ID or an array of IDs.
   * @param refresh - Whether to refresh the query after deletion.
   */
  const handleDeleteSuccess = (ids: BaseKey | BaseKey[], refresh = true) => {
    if (refresh) {
      query.refetch();
    }

    ids = typeof ids === 'string' || typeof ids === 'number' ? [ids] : ids;

    debugger;

    if (pagination && query.data?.data?.length === ids.length && current > 1) {
      setCurrent(current - 1);
    }

    const newCheckedKeys = checkedKeys.filter((key) => !(ids as BaseKey[]).includes(key));
    const newSelectedKeys = selectedKeys.filter((key) => !(ids as BaseKey[]).includes(key));

    setCheckedKeys(newCheckedKeys);
    setSelectedKeys(newSelectedKeys);
  };

  // Recursive function to collect all keys
  const getAllKeys = (nodes: any[]): React.Key[] => {
    let keys: React.Key[] = [];
    nodes.forEach((node) => {
      keys.push(node[nodeValue || 'id']);

      if (node.children) {
        keys = keys.concat(getAllKeys(node.children));
      }
    });
    return keys;
  };

  const handleCheckedAll = () => {
    // Get all keys from the tree
    const allKeys = getAllKeys(query?.data?.data as TreeDataNode[]);

    // Combine allKeys with existing checkedKeys and remove duplicates
    const combinedKeys = Array.from(new Set([...checkedKeys, ...allKeys]));

    setCheckedKeys(combinedKeys as BaseKey[]);
    setSelectedKeys(combinedKeys as BaseKey[]);

    return combinedKeys as BaseKey[];
  };

  const handleUnCheckedAll = () => {
    setCheckedKeys([]);
    setSelectedKeys([]);
  };

  const treeProps = {
    treeData: (query?.data?.data as TreeDataNode[]) || [],
    checkable: true,
    blockNode: true,
    checkedKeys,
    onCheck: (keys) => {
      setCheckedKeys(keys as string[]);
      setSelectedKeys(keys as string[]);
    },
    selectedKeys,
    onSelect: (keys) => {
      setSelectedKeys(keys as string[]);
    },
    fieldNames: {
      title: nodeLabel || 'name',
      key: nodeValue || 'id',
    },
  } satisfies TreeProps;

  return {
    treeProps,
    query,
    current,
    pageSize,
    checkedKeys,
    selectedKeys,
    handleSearch,
    handleDeleteSuccess,
    setCurrent,
    setPageSize,
    handleCheckedAll,
    handleUnCheckedAll,
  };
};
