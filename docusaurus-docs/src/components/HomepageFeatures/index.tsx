import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '🏥 Complete Healthcare Solution',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Comprehensive hospital management system covering patient care, appointments,
        medical records, billing, inventory, and laboratory management. Everything
        you need to run a modern healthcare facility.
      </>
    ),
  },
  {
    title: '🚀 Modern Technology Stack',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Built with React 19, AdonisJS 6, MySQL 8, and TypeScript. Features real-time
        updates, responsive design, role-based access control, and multi-tenant
        architecture for scalable healthcare operations.
      </>
    ),
  },
  {
    title: '📖 Comprehensive Documentation',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Complete documentation with installation guides, user manuals, API reference,
        deployment instructions, and troubleshooting. Get started quickly with our
        5-minute setup guide and detailed tutorials.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
