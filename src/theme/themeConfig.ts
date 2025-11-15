import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    colorBgLayout: '#f0f2f5',
    fontSize: 14,
  },
  components: {
    Button: {
      primaryColor: '#fff',
    },
    Card: {
      borderRadiusLG: 12,
      boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.06)',
    },
  },
};

export default theme;
