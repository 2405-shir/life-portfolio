<template>
  <div class="min-h-screen bg-white">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-8">
        <NuxtLink to="/categories" class="text-sm text-gray-600 hover:text-black">
          ← Back
        </NuxtLink>
        <h1 class="mt-2 text-3xl font-semibold">{{ asset?.name }}</h1>
      </div>

      <div v-if="loading" class="text-gray-600">Loading...</div>
      <div v-else-if="!asset" class="text-gray-600">Asset not found.</div>
      <div v-else class="space-y-8">
        <!-- Asset Overview -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div class="card">
            <div class="text-sm text-gray-600">Current Value</div>
            <div class="mt-2 text-3xl font-semibold">{{ asset.currentValue }}</div>
          </div>
          <div v-if="asset.targetValue" class="card">
            <div class="text-sm text-gray-600">Target Value</div>
            <div class="mt-2 text-3xl font-semibold">{{ asset.targetValue }}</div>
          </div>
          <div class="card">
            <div class="text-sm text-gray-600">Type</div>
            <div class="mt-2 text-lg font-semibold">{{ asset.trackingType }}</div>
          </div>
        </div>

        <!-- Projects -->
        <div>
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold">Projects</h2>
            <button @click="showNewProjectModal = true" class="btn-primary">
              New Project
            </button>
          </div>
          
          <div v-if="projects.length === 0" class="text-gray-600">
            No projects yet.
          </div>
          <div v-else class="space-y-3">
            <div v-for="project in projects" :key="project.id" class="card">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-semibold">{{ project.name }}</h3>
                  <p v-if="project.description" class="mt-1 text-sm text-gray-600">
                    {{ project.description }}
                  </p>
                </div>
                <div class="text-sm font-medium">{{ project.status }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Investments -->
        <div>
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold">Recent Investments</h2>
            <button @click="showNewInvestmentModal = true" class="btn-primary">
              Log Investment
            </button>
          </div>

          <div v-if="investments.length === 0" class="text-gray-600">
            No investments yet.
          </div>
          <div v-else class="space-y-3">
            <div v-for="investment in investments" :key="investment.id" class="card">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold">{{ investment.amount }}</div>
                  <div v-if="investment.note" class="mt-1 text-sm text-gray-600">
                    {{ investment.note }}
                  </div>
                </div>
                <div class="text-sm text-gray-600">
                  {{ formatDate(investment.date) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Project Modal -->
      <div v-if="showNewProjectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="w-full max-w-md rounded-lg bg-white p-6">
          <h2 class="text-xl font-semibold">New Project</h2>
          
          <form @submit.prevent="handleProjectSubmit" class="mt-6 space-y-4">
            <div>
              <label class="block text-sm font-medium">Name</label>
              <input
                v-model="projectForm.name"
                type="text"
                required
                class="input-field mt-1"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium">Description</label>
              <textarea
                v-model="projectForm.description"
                class="input-field mt-1"
                rows="2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium">Status</label>
              <select v-model="projectForm.status" class="input-field mt-1">
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                @click="showNewProjectModal = false"
                type="button"
                class="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button type="submit" class="btn-primary flex-1">
                Create
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Investment Modal -->
      <div v-if="showNewInvestmentModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="w-full max-w-md rounded-lg bg-white p-6">
          <h2 class="text-xl font-semibold">Log Investment</h2>
          
          <form @submit.prevent="handleInvestmentSubmit" class="mt-6 space-y-4">
            <div>
              <label class="block text-sm font-medium">Amount</label>
              <input
                v-model.number="investmentForm.amount"
                type="number"
                required
                step="0.01"
                class="input-field mt-1"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium">Note</label>
              <textarea
                v-model="investmentForm.note"
                class="input-field mt-1"
                rows="2"
              />
            </div>

            <div class="flex gap-3 pt-4">
              <button
                @click="showNewInvestmentModal = false"
                type="button"
                class="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button type="submit" class="btn-primary flex-1">
                Log
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAssetStore } from '~/stores/assets'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const assetStore = useAssetStore()

const assetId = route.params.id as string
const loading = ref(false)
const asset = ref<any>(null)
const projects = ref<any[]>([])
const investments = ref<any[]>([])

const showNewProjectModal = ref(false)
const showNewInvestmentModal = ref(false)

const projectForm = ref({
  name: '',
  description: '',
  status: 'active',
})

const investmentForm = ref({
  amount: 0,
  note: '',
})

const handleProjectSubmit = async () => {
  try {
    const response = await $fetch('/api/projects', {
      method: 'POST',
      body: {
        ...projectForm.value,
        assetId,
      },
    })
    projects.value.push(response.data)
    showNewProjectModal.value = false
    projectForm.value = { name: '', description: '', status: 'active' }
  } catch (error) {
    console.error('Error:', error)
  }
}

const handleInvestmentSubmit = async () => {
  try {
    const response = await $fetch('/api/investments', {
      method: 'POST',
      body: {
        ...investmentForm.value,
        assetId,
      },
    })
    investments.value.unshift(response.data)
    showNewInvestmentModal.value = false
    investmentForm.value = { amount: 0, note: '' }
  } catch (error) {
    console.error('Error:', error)
  }
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  loading.value = true
  try {
    const assetResponse = await $fetch(`/api/assets/${assetId}`)
    asset.value = assetResponse.data
    
    const projectsResponse = await $fetch(`/api/projects?assetId=${assetId}`)
    projects.value = projectsResponse.data || []
    
    const investmentsResponse = await $fetch(`/api/investments?assetId=${assetId}`)
    investments.value = investmentsResponse.data || []
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
})
</script>
