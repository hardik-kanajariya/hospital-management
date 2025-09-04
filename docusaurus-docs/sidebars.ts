import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '🚀 Getting Started',
      items: [
        'quick-start',
        'system-requirements',
        'current-state',
        'installation',
        'technology-stack',
      ],
    },
    {
      type: 'category',
      label: '📖 User Guides',
      items: [
        'user-guide',
        'features',
      ],
    },
    {
      type: 'category',
      label: '🚀 Deployment',
      items: [
        'deployment/production',
        'deployment/docker',
      ],
    },
    {
      type: 'category',
      label: '🔧 Developer Resources',
      items: [
        'api-reference',
        'database-schema',
        'troubleshooting',
        {
          type: 'category',
          label: 'Developer Guides',
          items: [
            'developer/architecture',
            'developer/api-development',
            'developer/database-guide',
            'developer/customization',
            'developer/integration',
            'developer/deployment-guide',
            'developer/database-reference',
            'developer/monitoring',
            'developer/scalability',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
