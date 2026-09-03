import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'Asplitline Blog',
      url: '/',
      transparentMode: 'top',
    },
    links: [
      {
        text: '文章',
        url: '/',
        active: 'none',
      },
      {
        text: '分类',
        url: '/categories',
        active: 'nested-url',
      },
      {
        text: '标签',
        url: '/tags',
        active: 'nested-url',
      },
    ],
    githubUrl: 'https://github.com/Asplitline/ai-blog',
  };
}
