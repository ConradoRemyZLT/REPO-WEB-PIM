/* =====================================================================
   PIM · Parque Industrial Minero — DATOS EDITABLES DEL SITIO
   ---------------------------------------------------------------------
   Este es el único archivo que hace falta tocar para actualizar
   configuración, unidades/tipologías y estado de obra.
   Después de editar:  python build.py
   Todo texto lleva par ES / EN.
   ===================================================================== */
window.PIM_DATA = {

  /* ---------- CONFIGURACIÓN GENERAL ---------- */
  config: {
    // Endpoint del formulario (POST JSON). Mientras sea null, el envío
    // abre WhatsApp con el mensaje ya armado (ver whatsapp).
    formEndpoint: null,
    whatsapp: '5493413165100',            // +54 9 341 316-5100 (brochure)
    email: null,                          // p. ej. 'comercial@somoszlt.com'
    // Ubicación del parque. APROXIMADA (derivada del brochure, entre la
    // RN20 y el Aeropuerto de San Juan). Reemplazar por la exacta.
    parque: { lat: -31.5788, lng: -68.4318, aproximada: true },
    social: {
      youtube:   'https://www.youtube.com/@somoszlt',
      instagram: 'https://www.instagram.com/somos.zlt',
      linkedin:  'https://www.linkedin.com/company/somoszlt'
    }
  },

  /* ---------- UNIDADES Y TIPOLOGÍAS ----------
     Mientras la lista esté vacía (o todas en publicar:false) la sección
     muestra un estado "en preparación" con CTA al formulario.
     estado: 'disponible' | 'reservado' | 'vendido' | 'proximamente'
     tipo:   'lote' | 'nave' | 'modulo' | 'servicios'
     etapa:  1 | 2
     ----------------------------------------------------------------- */
  tipologias: [
    /* EJEMPLO — completar con datos reales y poner publicar:true
    {
      publicar: false,
      id: 'L-A',
      tipo: 'lote',
      etapa: 1,
      nombre:  { es: 'Lote industrial A', en: 'Industrial plot A' },
      superficie: '2.500 m²',
      frente: '40 m',
      unidades: 12,
      disponibles: 8,
      estado: 'disponible',
      detalle: { es: 'Frente a avenida principal, apto tránsito pesado.',
                 en: 'Main avenue frontage, heavy-traffic ready.' }
    },
    */
  ],

  /* ---------- ESTADO DE OBRA ----------
     estado: 'proyecto' | 'en-obra' | 'terminado' | 'a-definir' | 'a-confirmar'
     avance: 0–100 o null (null oculta la barra)
     video:  URL de YouTube del avance de obra (opcional)
     ----------------------------------------------------------------- */
  obra: {
    actualizado: null,                    // p. ej. '2026-10'
    etapas: [
      { id: 'e1',
        nombre: { es: 'Etapa 1', en: 'Phase 1' },
        estado: 'a-confirmar', avance: null, video: null,
        texto: { es: 'Primer desarrollo del parque, con frente a la RN20 y contigua a la nave de Mercado Libre.',
                 en: 'First development of the park, fronting RN20 and next to the Mercado Libre warehouse.' },
        hitos: [] },
      { id: 'ml',
        nombre: { es: 'Nave Mercado Libre', en: 'Mercado Libre warehouse' },
        estado: 'a-confirmar', avance: null, video: null,
        texto: { es: 'Nave logística de 4.370 m², operador ancla del parque.',
                 en: '4,370 m² logistics warehouse, the park’s anchor operator.' },
        hitos: [] },
      { id: 'e2',
        nombre: { es: 'Etapa 2', en: 'Phase 2' },
        estado: 'a-confirmar', avance: null, video: null,
        texto: { es: 'Ampliación hacia el Aeropuerto de San Juan.',
                 en: 'Expansion toward San Juan Airport.' },
        hitos: [] },
      { id: 'sv',
        nombre: { es: 'Áreas de servicios', en: 'Service areas' },
        estado: 'a-definir', avance: null, video: null,
        texto: { es: 'Proyecto a definir, sujeto a aprobaciones municipales y provinciales.',
                 en: 'Project to be defined, subject to municipal and provincial approvals.' },
        hitos: [] }
    ]
  }
};
