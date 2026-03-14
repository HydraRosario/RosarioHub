'use client'

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    color: string
    change?: string
    changeType?: 'positive' | 'negative'
}

export function StatCard({ title, value, icon, color, change, changeType }: StatCardProps) {
    return (
        <motion.div
            className="bg-white rounded-lg shadow p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    <div className="text-white">{icon}</div>
                </div>
            </div>
            {change && (
                <div className={`mt-4 flex items-center text-sm ${
                    changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {change} from last month
                </div>
            )}
        </motion.div>
    )
}
