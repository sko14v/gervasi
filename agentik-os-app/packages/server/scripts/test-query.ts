import { query } from '../src/services/graphify.service.js';
query('criterios').then(res => console.log('Result:', res));
