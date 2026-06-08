import PocketBase from 'pocketbase'
import type { TypedPocketBase } from '@/lib/pb.types'

const pb = new PocketBase(import.meta.env.VITE_PB_URL) as TypedPocketBase

pb.autoCancellation(false)

export default pb
