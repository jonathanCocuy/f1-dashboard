import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // next-intl 3.x sets this via experimental.turbo which is invalid in Next.js 16+.
  // Set the Turbopack alias directly at the top level instead.
  turbopack: {
    resolveAlias: {
      'next-intl/config': './src/i18n/request.ts',
    },
  },
};

export default withNextIntl(nextConfig);
