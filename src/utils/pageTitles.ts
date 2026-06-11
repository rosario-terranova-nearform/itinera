const PAGE_TITLE_RULES: Array<{ match: (pathname: string) => boolean; title: string }> = [
  { match: (pathname) => pathname === '/admin', title: 'Dashboard' },
  {
    match: (pathname) =>
      pathname.startsWith('/admin/calendar') || pathname.startsWith('/admin/appointments'),
    title: 'Pianificazione',
  },
  { match: (pathname) => pathname.startsWith('/admin/companies'), title: 'Aziende' },
  { match: (pathname) => pathname.startsWith('/admin/representatives'), title: 'Rappresentanti' },
  { match: (pathname) => pathname.startsWith('/admin/documents'), title: 'Documenti' },
  { match: (pathname) => pathname.startsWith('/admin/settings'), title: 'Impostazioni' },
  { match: (pathname) => pathname.startsWith('/rep/calendar'), title: 'Calendario' },
  { match: (pathname) => pathname.startsWith('/rep/profile'), title: 'Profilo' },
  { match: (pathname) => pathname.startsWith('/rep'), title: 'Dashboard' },
]

export function getPageTitle(pathname: string): string {
  return PAGE_TITLE_RULES.find(({ match }) => match(pathname))?.title ?? 'Itinera'
}
