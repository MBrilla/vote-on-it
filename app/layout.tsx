import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import 'antd/dist/reset.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vote On It',
  description: 'Create and vote on polls',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>

          <div className="min-h-full flex flex-col">
            {children}
          </div>

      </body>
    </html>
  );
}
