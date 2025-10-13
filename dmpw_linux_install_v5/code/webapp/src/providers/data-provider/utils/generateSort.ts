import type { CrudSorting } from '@refinedev/core';

export const generateSort = (sorters?: CrudSorting) => {
  if (sorters && sorters.length > 0) {
    return {
      sortColumn: sorters[0].field,
      sortDirection: sorters[0].order,
    };
  }

  return;
};
