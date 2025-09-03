import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'MedCare Pro - Hospital Management System',
  tagline: 'Complete Healthcare Solution Documentation',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.medcarepro.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'medcarepro', // Usually your GitHub org/user name.
  projectName: 'hospital-management', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Disable edit this page links for production docs
          // editUrl: 'https://github.com/medcarepro/hospital-management/tree/main/docusaurus-docs/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Disable edit this page links for production docs
          // editUrl: 'https://github.com/medcarepro/hospital-management/tree/main/docusaurus-docs/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/medcare-social-card.jpg',
    navbar: {
      title: 'MedCare Pro Docs',
      logo: {
        alt: 'MedCare Pro Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'dropdown',
          label: 'API Reference',
          position: 'left',
          items: [
            {
              label: 'REST API',
              to: '/docs/api/rest',
            },
            {
              label: 'Authentication',
              to: '/docs/api/auth',
            },
            {
              label: 'Webhooks',
              to: '/docs/api/webhooks',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Guides',
          position: 'left',
          items: [
            {
              label: 'Installation',
              to: '/docs/installation',
            },
            {
              label: 'Quick Start',
              to: '/docs/quick-start',
            },
            {
              label: 'User Guide',
              to: '/docs/user-guide',
            },
            {
              label: 'Admin Guide',
              to: '/docs/admin-guide',
            },
          ],
        },
        { to: '/blog', label: 'Updates', position: 'left' },
        {
          href: 'https://github.com/medcarepro/hospital-management',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'search',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'Installation Guide',
              to: '/docs/installation',
            },
            {
              label: 'User Manual',
              to: '/docs/user-guide',
            },
            {
              label: 'API Reference',
              to: '/docs/api',
            },
          ],
        },
        {
          title: 'Support',
          items: [
            {
              label: 'Documentation',
              to: '/docs',
            },
            {
              label: 'GitHub Issues',
              href: 'https://github.com/medcarepro/hospital-management/issues',
            },
            {
              label: 'Contact Support',
              href: 'mailto:support@medcarepro.com',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Updates & News',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/medcarepro/hospital-management',
            },
            {
              label: 'CodeCanyon',
              href: 'https://codecanyon.net/item/medcare-pro',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} MedCare Pro. All rights reserved. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
