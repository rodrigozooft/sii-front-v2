import { redirect } from 'next/navigation'

export default async function LocaleRootPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  
  // Redirect to signup as the default page for Chilean users
  redirect(`/${locale}/auth/registro`)
}