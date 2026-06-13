import { query } from './services/graphify.service.js';
query('criterios').then(res => console.log('Result:', res));
