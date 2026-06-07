/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export const Collections = {
	Authorigins: "_authOrigins",
	Externalauths: "_externalAuths",
	Mfas: "_mfas",
	Otps: "_otps",
	Superusers: "_superusers",
	AppointmentModifications: "appointment_modifications",
	Appointments: "appointments",
	Companies: "companies",
	Notifications: "notifications",
	SignedSheets: "signed_sheets",
	Users: "users",
} as const
export type Collections = typeof Collections[keyof typeof Collections]

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type AppointmentModificationsRecord = {
	appointment: RecordIdString
	id: string
	modified_by: RecordIdString
	new_datetime: IsoDateString
	old_datetime: IsoDateString
	reason?: string
}

export const AppointmentsStatusOptions = {
	"pending": "pending",
	"confirmed": "confirmed",
	"completed": "completed",
	"cancelled": "cancelled",
} as const
export type AppointmentsStatusOptions = typeof AppointmentsStatusOptions[keyof typeof AppointmentsStatusOptions]
export type AppointmentsRecord = {
	company: RecordIdString
	created_by: RecordIdString
	end_datetime?: IsoDateString
	id: string
	internal_notes?: string
	notes?: string
	original_datetime: IsoDateString
	reference_code?: string
	representative: RecordIdString
	scheduled_datetime: IsoDateString
	status: AppointmentsStatusOptions
}

export const CompaniesSegmentOptions = {
	"Enterprise": "Enterprise",
	"Mid-Market": "Mid-Market",
	"SMB": "SMB",
} as const
export type CompaniesSegmentOptions = typeof CompaniesSegmentOptions[keyof typeof CompaniesSegmentOptions]
export type CompaniesRecord = {
	address?: string
	city?: string
	contact_person?: string
	contact_title?: string
	email?: string
	id: string
	is_active?: boolean
	name: string
	notes?: string
	phone?: string
	postal_code?: string
	province?: string
	segment?: CompaniesSegmentOptions
}

export const NotificationsTypeOptions = {
	"appointment_created": "appointment_created",
	"appointment_updated": "appointment_updated",
	"appointment_confirmed": "appointment_confirmed",
	"appointment_modified": "appointment_modified",
	"signed_sheet_uploaded": "signed_sheet_uploaded",
	"appointment_cancelled": "appointment_cancelled",
} as const
export type NotificationsTypeOptions = typeof NotificationsTypeOptions[keyof typeof NotificationsTypeOptions]
export type NotificationsRecord = {
	appointment?: RecordIdString
	id: string
	is_read?: boolean
	message: string
	title: string
	type: NotificationsTypeOptions
	user: RecordIdString
}

export type SignedSheetsRecord = {
	appointment: RecordIdString
	file: FileNameString
	file_name: string
	file_size?: number
	id: string
	mime_type?: string
	notes?: string
	uploaded_by: RecordIdString
	viewed_at?: IsoDateString
	viewed_by_admin?: boolean
}

export const UsersRoleOptions = {
	"admin": "admin",
	"representative": "representative",
} as const
export type UsersRoleOptions = typeof UsersRoleOptions[keyof typeof UsersRoleOptions]
export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	first_name: string
	id: string
	is_active?: boolean
	job_title?: string
	last_name: string
	name?: string
	password: string
	phone?: string
	role: UsersRoleOptions
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type AppointmentModificationsResponse<Texpand = unknown> = Required<AppointmentModificationsRecord> & BaseSystemFields<Texpand>
export type AppointmentsResponse<Texpand = unknown> = Required<AppointmentsRecord> & BaseSystemFields<Texpand>
export type CompaniesResponse<Texpand = unknown> = Required<CompaniesRecord> & BaseSystemFields<Texpand>
export type NotificationsResponse<Texpand = unknown> = Required<NotificationsRecord> & BaseSystemFields<Texpand>
export type SignedSheetsResponse<Texpand = unknown> = Required<SignedSheetsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	appointment_modifications: AppointmentModificationsRecord
	appointments: AppointmentsRecord
	companies: CompaniesRecord
	notifications: NotificationsRecord
	signed_sheets: SignedSheetsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	appointment_modifications: AppointmentModificationsResponse
	appointments: AppointmentsResponse
	companies: CompaniesResponse
	notifications: NotificationsResponse
	signed_sheets: SignedSheetsResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
