import { handlers } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
