// El backend usa roles en español (tabla users.role); el frontend fue construido
// con roles en inglés (rutas /dashboard/:role, SIDEBARS, i18n). Este mapeo es el
// único punto de traducción entre ambos mundos.
export const BACKEND_TO_FRONTEND_ROLE = {
  turista: 'tourist',
  hotelero: 'hotelier',
  cliente: 'private_client',
  abogado: 'lawyer',
  admin: 'lawyer',
}

export const FRONTEND_TO_BACKEND_ROLE = {
  tourist: 'turista',
  hotelier: 'hotelero',
  private_client: 'cliente',
  lawyer: 'abogado',
}

export function mapRoleFromBackend(role) {
  return BACKEND_TO_FRONTEND_ROLE[role] ?? role
}
