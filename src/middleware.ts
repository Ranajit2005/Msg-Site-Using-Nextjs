import { NextRequest,NextResponse } from 'next/server'
export { default } from "next-auth/middleware"
import { getToken } from 'next-auth/jwt'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

    const token = await getToken({req: request})
    const url = request.nextUrl

    // If token is present, then it means user is already signin. So we need not to show those pages. We redirect in dashboard page
    if(token && 
        (
            url.pathname.startsWith('/sign-in') ||
            url.pathname.startsWith('/sign-up') ||
            url.pathname.startsWith('/verify') ||
            url.pathname.startsWith('/')
        )
    ){
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if(!token && url.basePath.startsWith('/dashboard')){
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
    matcher: [
    '/dashboard/:path*',
      '/sign-in',
      '/sign-up',
      '/',
      '/verify/:path*'
    ]
  }
