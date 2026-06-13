/**
 * Barrel de páginas — re-exports de los componentes de página.
 *
 * Cada página es un default export (Home, IronMonkey, Growing, ...).
 * Este barrel los re-exporta con nombres amigables para los importadores.
 */

export { default as Home } from './Home';
export { default as IronMonkey } from './IronMonkey';
export { default as Growing } from './Growing';
export { default as Dashboard } from './Dashboard';
export { default as Memory } from './Memory';
export { default as Settings } from './Settings';

// Aliases legacy (mantienen compatibilidad con el scaffold anterior)
export { default as HomePage } from './Home';
export { default as IronMonkeyPage } from './IronMonkey';
export { default as GrowingPage } from './Growing';
