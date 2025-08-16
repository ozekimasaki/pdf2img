// Ensure default export exists for CJS/UMD-style pako when imported from ESM
import * as pakoNS from 'pako';
export default pakoNS as unknown as typeof import('pako');
export * from 'pako';
