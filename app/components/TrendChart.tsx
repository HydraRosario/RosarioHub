'use client'

import { useMemo } from 'react'

interface DataPoint {
    timestamp: string
    value: number
}

interface TrendChartProps {
    data: DataPoint[]
    color?: string
    height?: number
    label?: string
}

export function TrendChart({ data, color = 'var(--color-primary)', height = 60, label }: TrendChartProps) {
    const points = useMemo(() => {
        if (!data || data.length < 2) return ''
        
        const min = Math.min(...data.map(d => d.value))
        const max = Math.max(...data.map(d => d.value))
        const range = max - min || 1
        
        const width = 200
        const padding = 5
        const usableHeight = height - padding * 2
        
        return data.map((d, i) => {
            const x = (i / (data.length - 1)) * width
            const y = height - padding - ((d.value - min) / range) * usableHeight
            return `${x},${y}`
        }).join(' ')
    }, [data, height])

    if (!data || data.length < 2) return null

    return (
        <div className="flex flex-col gap-1 w-full">
            {label && <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">{label}</span>}
            <div className="relative group" style={{ height }}>
                <svg 
                    viewBox={`0 0 200 ${height}`} 
                    preserveAspectRatio="none" 
                    className="w-full h-full overflow-visible"
                >
                    {/* Gradient Fill */}
                    <defs>
                        <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    
                    <polyline
                        points={points}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]"
                    />
                    
                    <path
                        d={`M 0,${height} L ${points} L 200,${height} Z`}
                        fill={`url(#grad-${label})`}
                    />

                    {/* Interaction point */}
                    <circle 
                        cx="200" 
                        cy={points.split(' ').pop()?.split(',')[1]} 
                        r="3" 
                        fill={color}
                        className="animate-pulse"
                    />
                </svg>
            </div>
        </div>
    )
}
