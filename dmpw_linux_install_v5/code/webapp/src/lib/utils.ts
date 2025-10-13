import { SelectProps } from 'antd';

export function fixAntdProLayerOrder() {
  const TARGET_HASH = '_layer-@layer antd-pro';

  const cleanUpLayerTag = () => {
    const styleTag = document.querySelector(`style[data-rc-order="prepend"][data-css-hash="${TARGET_HASH}"]`);

    if (styleTag && styleTag.textContent?.trim() === '@layer antd,antd-pro;') {
      console.warn('🚨 Removing AntD Pro @layer override.');
      styleTag.remove();
    }
  };

  // Initial run in case it's already there
  cleanUpLayerTag();

  // Observe future injections
  const observer = new MutationObserver(() => {
    cleanUpLayerTag();
  });

  observer.observe(document.head, { childList: true, subtree: true });
}

export const isClient = typeof window !== 'undefined';

// Helper function to trigger file download
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const formatNumber = (value: number | undefined | null, locale = 'vi-VN') => {
  if (typeof value !== 'number') return 0;

  return value.toLocaleString(locale);
};

/**
 * Merge options from both arrays and ensure uniqueness
 * @param options - The options to merge
 * @param defaultOptions - The default options to merge
 * @returns The merged options
 */
export const mergeOptions = (options: SelectProps['options'] = [], defaultOptions: SelectProps['options'] = []) => {
  if (!options?.length) return defaultOptions;
  if (!defaultOptions?.length) return options;

  const uniqueOptions = new Map();

  // Add all options from both arrays to the Map with value as key to ensure uniqueness
  [...options, ...defaultOptions].forEach((option) => {
    uniqueOptions.set(option.value, option);
  });

  // Convert Map values back to array
  return Array.from(uniqueOptions.values());
};

export const filterSelectOption = (input: string, option: any) => {
  const label = option?.label || '';
  return label.toString().toLowerCase().includes(input.toLowerCase());
};
