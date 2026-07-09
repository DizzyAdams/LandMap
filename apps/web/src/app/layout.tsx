// Pass-through root layout. The document (<html>/<body>) is owned by
// app/[locale]/layout.tsx, which handles fonts, i18n, nav/footer and the
// brand background. Returning children keeps a single document in the tree.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
