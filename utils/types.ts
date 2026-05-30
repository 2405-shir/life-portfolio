// Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

// Entity types
export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  userId: string
  name: string
  description?: string
  color: string
  targetAllocation: number
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  archivedAt?: Date
}

export interface Asset {
  id: string
  categoryId: string
  name: string
  description?: string
  trackingType: 'numeric' | 'currency' | 'hours' | 'count' | 'percentage' | 'rating' | 'milestone' | 'notes'
  timeHorizon: 'short' | 'medium' | 'long'
  targetValue?: number
  currentValue: number
  createdAt: Date
  updatedAt: Date
  archivedAt?: Date
}

export interface Project {
  id: string
  assetId: string
  name: string
  description?: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  startDate: Date
  targetDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Investment {
  id: string
  assetId: string
  projectId?: string
  amount: number
  note?: string
  date: Date
  createdAt: Date
}

export interface Note {
  id: string
  userId: string
  title: string
  content?: string
  categoryId?: string
  assetId?: string
  projectId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id: string
  userId: string
  name: string
  createdAt: Date
}

export interface NoteLink {
  id: string
  fromNoteId: string
  toNoteId: string
  createdAt: Date
}

export interface Review {
  id: string
  userId: string
  type: 'weekly' | 'monthly' | 'quarterly' | 'annual'
  date: Date
  createdAt: Date
  updatedAt: Date
}

export interface ReviewResponse {
  id: string
  reviewId: string
  question: string
  answer?: string
  createdAt: Date
  updatedAt: Date
}

export interface Settings {
  id: string
  userId: string
  theme: string
  currency: string
  createdAt: Date
  updatedAt: Date
}

// Extended types with relations
export interface CategoryWithAssets extends Category {
  assets?: Asset[]
  notes?: Note[]
}

export interface AssetWithRelations extends Asset {
  category?: Category
  projects?: Project[]
  investments?: Investment[]
  notes?: Note[]
}

export interface ProjectWithRelations extends Project {
  asset?: Asset
  investments?: Investment[]
  notes?: Note[]
}

export interface NoteWithRelations extends Note {
  category?: Category
  asset?: Asset
  project?: Project
  tags?: Tag[]
  linkFrom?: NoteLink[]
  linkTo?: NoteLink[]
}

export interface ReviewWithResponses extends Review {
  responses?: ReviewResponse[]
}
