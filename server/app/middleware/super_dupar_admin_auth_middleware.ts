import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import SuperDuparAdmin from '#models/super_dupar_admin'

/**
 * Super Dupar Admin auth middleware
 */
export default class SuperDuparAdminAuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/super-dupar-admin/login'

  async handle(ctx: HttpContext, next: NextFn) {
    try {
      const authHeader = ctx.request.header('authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.response.status(401).json({
          success: false,
          message: 'Unauthorized - Token required'
        })
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix
      
      // Find super dupar admin by token manually
      // First, we need to find the access token record
      const superDuparAdmin = await SuperDuparAdmin.query()
        .whereRaw('EXISTS (SELECT 1 FROM super_dupar_admin_access_tokens WHERE user_id = super_dupar_admins.id AND token = ?)', [token])
        .first()
      
      if (!superDuparAdmin) {
        return ctx.response.status(401).json({
          success: false,
          message: 'Unauthorized - Invalid token'
        })
      }

      if (!superDuparAdmin.isActive) {
        return ctx.response.status(401).json({
          success: false,
          message: 'Unauthorized - Account deactivated'
        })
      }

      // Attach super dupar admin to context
      ctx.superDuparAdmin = superDuparAdmin
      
      return next()
    } catch (error) {
      console.error('Super Dupar Admin auth middleware error:', error)
      return ctx.response.status(401).json({
        success: false,
        message: 'Unauthorized - Authentication failed'
      })
    }
  }
}
