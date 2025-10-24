import React from 'react';
import dynamic from 'next/dynamic';
const ModalPrimitive = dynamic(() => import('antd').then((mod) => mod.Modal), { ssr: false });

export default function Modal({ cancelButtonProps, ...props }: React.ComponentProps<typeof ModalPrimitive>) {
  return (
    <ModalPrimitive cancelButtonProps={{ color: 'primary', variant: 'outlined', ...cancelButtonProps }} {...props} />
  );
}
