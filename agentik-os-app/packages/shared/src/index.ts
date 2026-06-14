/**
 * Barrel re-export. La app y el server consumen `@agentik-os/shared`
 * y solo necesitan importar desde la raíz.
 */

export * from './types/lead.js';
export * from './types/llamada.js';
export * from './types/prospecto.js';
export * from './types/sesion.js';
export * from './types/digest.js';

export * from './constants/estados-lead.js';

export * from './validators/lead.schema.js';

// Casa de Apuestas — Growing Inmobiliario
export * from './types/betting.js';
export * from './lib/betting.js';
