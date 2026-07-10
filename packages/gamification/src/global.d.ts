// Ambient declarations so the engine/UI typecheck cleanly even before
// `@landmap/ui` is built (its `index.ts` imports `./styles.css`).
declare module '*.css';
declare module '*.css?inline';
