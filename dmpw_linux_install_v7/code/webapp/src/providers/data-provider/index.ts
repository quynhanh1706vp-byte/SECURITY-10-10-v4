'use client';

import type { DataProvider } from '@refinedev/core';
import { BaseQuery, BaseResponse } from '@types';
import type { AxiosInstance } from 'axios';
import { stringify } from 'querystring';

import { axiosInstance, generateFilter, generateSort } from './utils';

type MethodTypes = 'get' | 'delete' | 'head' | 'options';
type MethodTypesWithBody = 'post' | 'put' | 'patch';

const restDataProvider = (
  apiUrl: string,
  httpClient: AxiosInstance = axiosInstance,
): Omit<Required<DataProvider>, 'createMany' | 'updateMany'> => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = `${apiUrl}/${resource}`;

    const { current = 1, pageSize = 10, mode = 'server' } = pagination ?? {};

    const { headers: headersFromMeta, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? 'get';

    const queryFilters = generateFilter(filters);

    const query: BaseQuery = {
      pageNumber: current,
      pageSize: pageSize,
      sortColumn: undefined,
      sortDirection: undefined,
    };

    const generatedSort = generateSort(sorters);
    if (generatedSort) {
      const { sortColumn, sortDirection } = generatedSort;
      query.sortColumn = sortColumn;
      query.sortDirection = sortDirection;
    }

    const combinedQuery = { ...query, ...queryFilters };
    const urlWithQuery = Object.keys(combinedQuery).length ? `${url}?${stringify(combinedQuery)}` : url;

    const { data } = await httpClient[requestMethod]<BaseResponse>(urlWithQuery, {
      headers: headersFromMeta,
    });

    // Handle the response data based on the expected structure
    // If the data is an array, return it directly.
    // If it has a meta property, return the total count from there.
    if (Array.isArray(data)) {
      return { data, total: data.length };
    } else {
      return {
        ...data,
        total: data?.meta?.recordsFiltered || data?.data?.length,
      };
    }
  },

  getMany: async ({ resource, ids, meta }) => {
    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? 'get';

    const { fetchSingle } = meta || {};

    // Some APIs not support fetching multiple items -> using fetchSingle flag to fetch a single item.
    // Usage for fetching default option in Select component.
    if (fetchSingle) {
      const { data } = await httpClient[requestMethod](`${apiUrl}/${resource}/${ids[0]}`, { headers });

      return { data: [data] };
    }

    const { data } = await httpClient[requestMethod](`${apiUrl}/${resource}?${stringify({ id: ids })}`, { headers });

    return { data };
  },

  create: async ({ resource, variables, meta }) => {
    const url = `${apiUrl}/${resource}`;

    const { headers, method, params } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? 'post';

    const { data } = await httpClient[requestMethod](url, variables, {
      headers,
      params,
    });

    return {
      data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? 'put';

    const { data } = await httpClient[requestMethod](url, variables, {
      headers,
    });

    return {
      data,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? 'get';

    const { data } = await httpClient[requestMethod](url, { headers });

    return {
      data,
    };
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? 'delete';

    const { data } = await httpClient[requestMethod](url, {
      data: variables,
      headers,
    });

    return {
      data,
    };
  },

  deleteMany: async ({ resource, ids, variables, meta }) => {
    // You can handle the request according to your API requirements.
    const url = `${apiUrl}/${resource}?${stringify({ ids })}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? 'delete';
    const { data } = await httpClient[requestMethod](url, {
      // data: variables,
      data: variables || ids,
      headers,
    });

    return {
      data,
    };
  },

  getApiUrl: () => {
    return apiUrl;
  },

  custom: async ({ url, method, filters, sorters, payload, query, headers, meta }) => {
    let requestUrl = url.startsWith('http') ? url : `${apiUrl}/${url}`;

    let queryParams = {};

    if (sorters) {
      const generatedSort = generateSort(sorters);
      if (generatedSort) {
        const { sortColumn, sortDirection } = generatedSort;
        queryParams = {
          sortColumn,
          sortDirection,
        };
      }
    }

    const queryFilters = generateFilter(filters);

    const combinedQuery = { ...queryParams, ...queryFilters, ...query };

    requestUrl = Object.keys(combinedQuery).length > 0 ? `${requestUrl}?${stringify(combinedQuery)}` : requestUrl;

    const { isDownload } = meta ?? {};

    let axiosResponse;
    switch (method) {
      case 'put':
      case 'post':
      case 'patch':
        axiosResponse = await httpClient[method](requestUrl, payload, {
          headers,
        });
        break;
      case 'delete':
        axiosResponse = await httpClient.delete(requestUrl, {
          data: payload,
          headers: headers,
        });
        break;
      default:
        axiosResponse = await httpClient.get(requestUrl, {
          headers,
          ...(isDownload && { responseType: 'blob' }),
        });
        break;
    }

    const { data } = axiosResponse;

    return { data };
  },
});

import { env } from 'next-runtime-env';

export const dataProvider = restDataProvider(env('NEXT_PUBLIC_API_ENDPOINT') || '');
