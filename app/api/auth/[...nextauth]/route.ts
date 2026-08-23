import { handlers } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'dayflow-hrms-phi.vercel.app';
const baseUrl = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;

process.env.NEXTAUTH_URL = baseUrl;
process.env.AUTH_URL = baseUrl;

async function safeHandler(req: NextRequest) {
  try {
    const res = await handlers.POST(req);
    return res;
  } catch (err: any) {
    return NextResponse.json({ 
      error: 'NextAuth Fatal Error', 
      message: err.message, 
      stack: err.stack 
    }, { status: 500 });
  }
}

async function safeHandlerGet(req: NextRequest) {
  try {
    const res = await handlers.GET(req);
    return res;
  } catch (err: any) {
    return NextResponse.json({ 
      error: 'NextAuth Fatal Error', 
      message: err.message, 
      stack: err.stack 
    }, { status: 500 });
  }
}

export { safeHandlerGet as GET, safeHandler as POST };
