<template>
  <div class="min-h-screen bg-white">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <NuxtLink to="/categories" class="text-sm text-gray-600 hover:text-black">
            ← Back to Categories
          </NuxtLink>
          <h1 class="mt-2 text-3xl font-semibold">{{ category?.name }}</h1>
        </div>
        <button @click="showNewModal = true" class="btn-primary">
          New Asset
        </button>
      </div>

      <div v-if="loading" class="text-gray-600">Loading...</div>
      <div v-else-if="!category" class="text-gray-600">Category not found.</div>
      <div v-else>
        <div v-if="category.description" class="mb-6 text-gray-600">
          {{ category.description }}
        </div>

        <div v-if="assets.length === 0" class="text-gray-600">
          No assets in this category yet.
        </div>
        <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="asset in assets" :key="asset.id" class="card">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-semibold">{{ asset.name }}</h3>
                <p v-if="asset.description" class="mt-1 text-sm text-gray-600">
                  {{ asset.description }}
                </p>
              </div>
              <div class="flex gap-2">
                <button
                  @click="editAsset(asset)"
                  class="text-gray-400 hover:text-gray-600"
                >
                  Edit
                </button>
                <button
                  @click="deleteAsset(asset.id)"
                  class="text-gray-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            <div class="mt-4 space-y-1 text-sm text-gray-600">
              <div>Type: {{ asset.trackingType }}</div>
              <div v-if="asset.targetValue">Target: {{ asset.targetValue }}</div>
              <div>Current: {{ asset.currentValue }}</div>
            </div>
            <NuxtLink
              :to="`/assets/${asset.id}`"
              class="mt-4 inline-block text-sm font-medium text-black hover:underline"
            >
              View Details →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- New/Edit Modal -->
      <div v-if="showNewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="w-full max-w-md rounded-lg bg-white p-6">
          <h2 class="text-xl font-semibold">{{ editing ? 'Edit' : 'New' }} Asset</h2>
          
          <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
            <div>
              <label class="block text-sm font-medium">Name</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input-field mt-1"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium">Description</label>
              <textarea
                v-model="form.description"
                class="input-field mt-1"
                rows="2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium">Tracking Type</label>
              <select v-model="form.trackingType" class="input-field mt-1">
                <option value="numeric">Numeric</option>
                <option value="currency">Currency</option>
                <option value="hours">Hours</option>
                <option value="count">Count</option>
                <option value="percentage">Percentage</option>
                <option value="rating">Rating</option>
                <option value="milestone">Milestone</option>
                <option value="notes">Notes</option>
              </select>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                @click="showNewModal = false"
                type="button"
                class="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn-primary flex-1"
              >
                {{ editing ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCategoryStore } from '~/stores/categories'
import { useAssetStore } from '~/stores/assets'
import type { Asset } from '~/utils/types'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const categoryStore = useCategoryStore()
const assetStore = useAssetStore()

const categoryId = route.params.id as string
const category = computed(() => categoryStore.getCategoryById(categoryId))
const assets = computed(() =>
  assetStore.assets.filter(a => a.categoryId === categoryId)
)

const loading = ref(false)
const showNewModal = ref(false)
const editing = ref(false)
const editingId = ref<string | null>(null)

const form = ref({
  name: '',
  description: '',
  trackingType: 'numeric',
})

const handleSubmit = async () => {
  try {
    if (editing.value && editingId.value) {
      await assetStore.updateAsset(editingId.value, form.value)
    } else {
      await assetStore.createAsset({
        ...form.value,
        categoryId,
      })
    }
    showNewModal.value = false
    resetForm()
  } catch (error) {
    console.error('Error:', error)
  }
}

const editAsset = (asset: Asset) => {
  editing.value = true
  editingId.value = asset.id
  form.value = {
    name: asset.name,
    description: asset.description || '',
    trackingType: asset.trackingType,
  }
  showNewModal.value = true
}

const deleteAsset = async (id: string) => {
  if (confirm('Are you sure?')) {
    try {
      await assetStore.deleteAsset(id)
    } catch (error) {
      console.error('Error:', error)
    }
  }
}

const resetForm = () => {
  form.value = { name: '', description: '', trackingType: 'numeric' }
  editing.value = false
  editingId.value = null
}

onMounted(async () => {
  loading.value = true
  await categoryStore.fetchCategories()
  await assetStore.fetchAssets(categoryId)
  loading.value = false
})
</script>
