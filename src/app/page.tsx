import { redirect } from 'next/navigation'

export default function RootPage(): never {
  // Redirect to Spanish locale (default for Chilean users)
  redirect('/es')
}
