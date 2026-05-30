import { db } from '~/server/db'
import { categories, assets, projects, investments, notes, reviews } from '~/server/db/schema'
import { or, ilike, and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = 'default-user' // TODO: Replace with actual auth
  const query = getQuery(event)
  const q = query.q as string
  const limit = parseInt(query.limit as string) || 50
  const offset = parseInt(query.offset as string) || 0
  
  if (!q || q.length < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Query parameter required' })
  }
  
  const searchPattern = `%${q}%`
  
  // Search across all entities
  const categoriesResults = await db.query.categories.findMany({
    where: and(
      eq(categories.userId, userId),
      ilike(categories.name, searchPattern)
    ),
    limit,
    offset,
  })
  
  const assetsResults = await db.query.assets.findMany({
    where: ilike(assets.name, searchPattern),
    limit,
    offset,
  })
  
  const projectsResults = await db.query.projects.findMany({
    where: ilike(projects.name, searchPattern),
    limit,
    offset,
  })
  
  const investmentsResults = await db.query.investments.findMany({
    where: ilike(investments.note, searchPattern),
    limit,
    offset,
  })
  
  const notesResults = await db.query.notes.findMany({
    where: and(
      eq(notes.userId, userId),
      or(
        ilike(notes.title, searchPattern),
        ilike(notes.content, searchPattern)
      )
    ),
    limit,
    offset,
  })
  
  const reviewsResults = await db.query.reviews.findMany({
    where: eq(reviews.userId, userId),
    with: {
      responses: {
        where: or(
          ilike(reviewResponses.question, searchPattern),
          ilike(reviewResponses.answer, searchPattern)
        )
      }
    },
    limit,
    offset,
  })
  
  const results = {
    categories: categoriesResults,
    assets: assetsResults,
    projects: projectsResults,
    investments: investmentsResults,
    notes: notesResults,
    reviews: reviewsResults,
  }
  
  return { data: results, status: 200 }
})
