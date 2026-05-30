import { db } from '~/server/db'
import { investments } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (event.node.req.method === 'GET') {
    // Get single investment
    const investment = await db.query.investments.findFirst({
      where: eq(investments.id, id),
      with: {
        asset: true,
        project: true,
      }
    })
    
    if (!investment) {
      throw createError({ statusCode: 404, statusMessage: 'Investment not found' })
    }
    
    return { data: investment, status: 200 }
  }
  
  if (event.node.req.method === 'DELETE') {
    // Delete investment
    await db.delete(investments).where(eq(investments.id, id))
    return { data: null, status: 204 }
  }
})
