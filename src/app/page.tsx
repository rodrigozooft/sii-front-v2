import { redirect } from 'next/navigation'

export default function Home(): never {
  // Redirect to signup page as the main entry point
  redirect('/auth/signup')
}
