import { useMutation } from '@tanstack/react-query'
import {
  updatePassword,
  updateProfile,
  uploadAvatar,
  type PasswordUpdateInput,
  type ProfileUpdateInput,
} from '@/api/users'
import pb from '@/lib/pocketbase'
import { useAuthStore } from '@/store/authStore'
import type { UserRecord } from '@/types'

function syncAuthModel(record: UserRecord) {
  pb.authStore.save(pb.authStore.token, record)
  useAuthStore.setState({ authModel: record })
}

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProfileUpdateInput }) =>
      updateProfile(id, data),
    onSuccess: syncAuthModel,
  })
}

export function useUploadAvatarMutation() {
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadAvatar(id, file),
    onSuccess: syncAuthModel,
  })
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PasswordUpdateInput }) =>
      updatePassword(id, data),
  })
}
