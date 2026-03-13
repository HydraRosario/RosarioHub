import { redirect } from 'next/navigation'

export default function HomePage() {
  // Por ahora redirigimos al factory (Admin Dashboard)
  redirect('/factory')
}
