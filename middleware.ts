import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Create a response to modify
    const res = NextResponse.next()

    // Create a Supabase client
    const supabase = createMiddlewareClient({ req: request, res })

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession()

    // Get the pathname
    const path = request.nextUrl.pathname

    // Define public paths
    const isPublicPath = 
      path === '/auth' || 
      path === '/auth/forgot-password' || 
      path.startsWith('/auth/callback')

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Handle redirects
    if (isPublicPath && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (!isPublicPath && !session) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    return res
  } catch (e) {
    // If there's an error, redirect to auth page
    return NextResponse.redirect(new URL('/auth', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}