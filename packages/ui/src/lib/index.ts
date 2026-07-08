export * from './classnames';
export * from './merge';

export const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');
