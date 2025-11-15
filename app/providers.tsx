'use client';

import { ConfigProvider, Layout } from 'antd';
import { ReactNode } from 'react';

// Simple theme configuration
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
  },
  components: {
    Button: {
      primaryColor: '#fff',
    },
  },
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={theme}>
      <Layout style={{ minHeight: '100vh' }}>
        <Layout.Content style={{ padding: '24px' }}>
          {children}
        </Layout.Content>
        <Layout.Footer style={{ textAlign: 'center', backgroundColor: '#fff', borderTop: '1px solid #f0f0f0' }}>
          {new Date().getFullYear()} Vote On It. All rights reserved.
        </Layout.Footer>
      </Layout>
    </ConfigProvider>
  );
}
