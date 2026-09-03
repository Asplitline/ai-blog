import './global.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppRootProvider } from '@/components/root-provider';

export const metadata: Metadata = {
  title: {
    default: 'Asplitline Blog',
    template: '%s · Asplitline Blog',
  },
  description: 'AI、Agent、前端与工程实践的个人技术博客。',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-fd-background text-fd-foreground">
        <AppRootProvider>{children}</AppRootProvider>
      </body>
    </html>
  );
}
