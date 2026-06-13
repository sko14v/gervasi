/**
 * IronMonkey — wrapper de página que renderiza el Pipeline.
 *
 * El `Pipeline` ya gestiona internamente:
 *  - el botón flotante "+ Nuevo lead" (fixed bottom-right),
 *  - el modal de creación de lead (`<LeadForm mode="create" />`),
 *  - el panel lateral con `LeadDetail` cuando hay un `currentLead`.
 *
 * Para una variante de "split view" sin overlay, basta con renderizar
 * `<Pipeline />` y `<LeadDetail />` lado a lado; de momento, el panel
 * lateral (drawer) cumple con la UX de split en desktop y modal
 * full-screen en mobile.
 */

import { Pipeline } from '@/components/ironmonkey/Pipeline';

export default function IronMonkey() {
  return (
    <div className="h-full">
      <Pipeline />
    </div>
  );
}
