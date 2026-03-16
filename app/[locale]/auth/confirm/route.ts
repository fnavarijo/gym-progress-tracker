import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  // Prefix for English locale; Spanish (default) has no prefix
  const localePrefix = locale === 'en' ? '/en' : '';

  if (tokenHash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      // redirect user to specified redirect URL or root of app
      return NextResponse.redirect(`${origin}${localePrefix}${next}`);
    } else {
      // redirect the user to an error page with some instructions
      return NextResponse.redirect(
        `${origin}${localePrefix}/auth/error?error=${error?.message}`,
      );
    }
  }

  // redirect the user to an error page with some instructions
  return NextResponse.redirect(
    `${origin}${localePrefix}/auth/error?error=No token hash or type`,
  );
}
