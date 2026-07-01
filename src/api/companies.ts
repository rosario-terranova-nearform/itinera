import pb from '@/lib/pocketbase'
import type { CompanyRecord } from '@/types'

export type CompanyCreateInput = {
  name: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  segment?: 'Enterprise' | 'Mid-Market' | 'SMB' | ''
  contact_person?: string
  contact_title?: string
  phone?: string
  email?: string
  notes?: string
}

export type CompanyUpdateInput = Partial<CompanyCreateInput>

export async function getAll(filter?: string): Promise<CompanyRecord[]> {
  return pb.collection('companies').getFullList<CompanyRecord>({
    sort: 'name',
    filter: filter || undefined,
  })
}

export async function getById(id: string): Promise<CompanyRecord> {
  return pb.collection('companies').getOne<CompanyRecord>(id)
}

export async function create(data: CompanyCreateInput): Promise<CompanyRecord> {
  return pb.collection('companies').create<CompanyRecord>(data)
}

export async function update(id: string, data: CompanyUpdateInput): Promise<CompanyRecord> {
  return pb.collection('companies').update<CompanyRecord>(id, data)
}

export async function softDelete(id: string): Promise<CompanyRecord> {
  return pb.collection('companies').update<CompanyRecord>(id, { is_active: false })
}

export function formatCompanyAddress(company: Pick<
  CompanyRecord,
  'address' | 'city' | 'province' | 'postal_code'
>): string {
  return [company.address, company.city, company.province, company.postal_code]
    .filter(Boolean)
    .join(', ')
}

export function filterCompaniesBySearch(
  companies: CompanyRecord[],
  query: string,
): CompanyRecord[] {
  const q = query.trim().toLowerCase()
  if (!q) return companies

  return companies.filter((company) => {
    const address = formatCompanyAddress(company).toLowerCase()
    const contact = [company.contact_person, company.contact_title].filter(Boolean).join(' ').toLowerCase()
    const segment = company.segment?.toLowerCase() ?? ''

    return (
      company.name.toLowerCase().includes(q) ||
      segment.includes(q) ||
      contact.includes(q) ||
      address.includes(q)
    )
  })
}
