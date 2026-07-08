import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import CompanyDirectoryCard from '@/components/companies/CompanyDirectoryCard'
import EmptyState from '@/components/common/EmptyState'
import { filterCompaniesBySearch } from '@/api/companies'
import { useCompaniesQuery } from '@/hooks/useCompanies'

export default function RepCompaniesPage() {
  const { data: companies = [], isLoading, error } = useCompaniesQuery()
  const [search, setSearch] = useState('')

  const activeCompanies = useMemo(
    () => companies.filter((company) => company.is_active !== false),
    [companies],
  )

  const filteredCompanies = useMemo(
    () => filterCompaniesBySearch(activeCompanies, search),
    [activeCompanies, search],
  )

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Rubrica aziende
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Elenco di riferimento per consultazione rapida.
          </Typography>
        </Box>

        <TextField
          placeholder="Cerca per segmento, referente o indirizzo..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          sx={{ minWidth: { xs: '100%', sm: 320 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Errore nel caricamento delle aziende.
        </Alert>
      ) : null}

      {isLoading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={140} />
          ))}
        </Box>
      ) : filteredCompanies.length === 0 ? (
        <EmptyState
          title="Nessuna azienda"
          description={
            search.trim()
              ? 'Nessuna azienda corrisponde alla ricerca.'
              : 'Non ci sono aziende disponibili.'
          }
          icon={<BusinessOutlinedIcon sx={{ fontSize: 36 }} />}
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {filteredCompanies.map((company) => (
            <CompanyDirectoryCard key={company.id} company={company} />
          ))}
        </Box>
      )}
    </Box>
  )
}
