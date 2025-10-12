import dynamic from 'next/dynamic'

export const Effects = dynamic(() => import('./EffectsInternal').then((mod) => mod.Effects), { ssr: false })
