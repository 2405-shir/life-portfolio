import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Note } from '~/utils/types'

export const useNoteStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchNotes = async (assetId?: string, categoryId?: string) => {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (assetId) params.append('assetId', assetId)
      if (categoryId) params.append('categoryId', categoryId)
      const query = params.toString() ? `?${params.toString()}` : ''
      
      const response = await $fetch(`/api/notes${query}`)
      notes.value = response.data || []
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const createNote = async (data: any) => {
    try {
      const response = await $fetch('/api/notes', {
        method: 'POST',
        body: data,
      })
      notes.value.unshift(response.data)
      return response.data
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  const updateNote = async (id: string, data: any) => {
    try {
      const response = await $fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        body: data,
      })
      const index = notes.value.findIndex(n => n.id === id)
      if (index > -1) {
        notes.value[index] = response.data
      }
      return response.data
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  const deleteNote = async (id: string) => {
    try {
      await $fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      })
      notes.value = notes.value.filter(n => n.id !== id)
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  }
})
