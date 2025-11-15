'use client';

import { Layout, Typography, Button } from 'antd';
import Link from 'next/link';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export default function Header() {
  return (
    <AntHeader className="bg-white shadow-sm flex items-center px-6">
      <Link href="/" className="flex items-center">
        <Title level={4} className="!mb-0 !text-blue-600">
          Vote On It
        </Title>
      </Link>
      <div className="ml-auto">
        <Button type="primary" href="/" className="ml-4">
          Create Poll
        </Button>
      </div>
    </AntHeader>
  );
}
