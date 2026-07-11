import type { Preview } from '@storybook/react';
import '@landmap/ui/styles.css';
import '../apps/web/src/app/globals.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'sovereign',
      values: [
        { name: 'sovereign', value: '#050505' },
        { name: 'surface', value: '#0a0a0a' },
      ],
    },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: 32,
          minHeight: '100vh',
          background: '#050505',
          color: 'var(--text)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
