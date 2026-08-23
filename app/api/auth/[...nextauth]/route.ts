import { handlers } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function safeHandler(req: NextRequest, ctx: any) {
  try {
    const res = await handlers.POST(req, ctx);
    return res;
  } catch (err: any) {
    return NextResponse.json({ 
      error: 'NextAuth Fatal Error', 
      message: err.message, 
      stack: err.stack 
    }, { status: 500 });
  }
}

async function safeHandlerGet(req: NextRequest, ctx: any) {
  try {
    const res = await handlers.GET(req, ctx);
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
