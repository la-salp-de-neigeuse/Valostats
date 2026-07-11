import type { FC, SVGProps } from 'react'

function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function MatchesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function LeaderboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 6 9 6 9z" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 18 9 18 9z" />
      <path d="M4 22h16" />
      <path d="M10 22V2h4v20" />
      <path d="M4 22h16" />
      <path d="M10 22V2h4v20" />
    </svg>
  )
}

function CoachIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

function GoalsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function PredictionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function ProfileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export interface NavItem {
  href: string
  label: string
  icon: FC<SVGProps<SVGSVGElement>>
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Tableau de bord', icon: DashboardIcon },
  { href: '/matches', label: 'Matchs', icon: MatchesIcon },
  { href: '/leaderboard', label: 'Classement', icon: LeaderboardIcon },
  { href: '/ai-coach', label: 'Coach IA', icon: CoachIcon },
  { href: '/prediction', label: 'Prédiction', icon: PredictionIcon },
  { href: '/goals', label: 'Objectifs', icon: GoalsIcon },
  { href: '/profile', label: 'Profil', icon: ProfileIcon },
]
