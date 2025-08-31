import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CaretRightIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
    title?: string
    description?: string
    icon?: React.ComponentType<any>
    badge?: {
        label: string
        variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    }
    breadcrumbs?: Array<{
        label: string
        href?: string
        current?: boolean
    }>
    actions?: React.ReactNode
    stats?: Array<{
        label: string
        value: string | number
        icon?: React.ComponentType<any>
        color?: string
    }>
    className?: string
    children?: React.ReactNode
}

export function PageHeader({
    title,
    description,
    icon: Icon,
    badge,
    breadcrumbs,
    actions,
    stats,
    className,
    children
}: PageHeaderProps) {
    return (
        <div className={cn("space-y-4", className)}>
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && (
                                <CaretRightIcon className="h-4 w-4 text-muted-foreground/50" />
                            )}
                            <span
                                className={cn(
                                    crumb.current
                                        ? "text-foreground font-medium"
                                        : "hover:text-foreground cursor-pointer"
                                )}
                            >
                                {crumb.label}
                            </span>
                        </React.Fragment>
                    ))}
                </nav>
            )}

            {/* Main Header Content */}
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    {/* Title Row */}
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 text-primary rounded-lg">
                                <Icon className="w-5 h-5" />
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {title && (
                                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                            )}
                            {badge && (
                                <Badge variant={badge.variant || 'secondary'}>
                                    {badge.label}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {description && (
                        <p className="text-muted-foreground max-w-2xl">{description}</p>
                    )}
                </div>

                {/* Actions */}
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>

            {/* Stats Row */}
            {stats && stats.length > 0 && (
                <>
                    <Separator />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, index) => {
                            const StatIcon = stat.icon
                            return (
                                <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                    {StatIcon && (
                                        <div className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-md",
                                            stat.color || "bg-primary/10 text-primary"
                                        )}>
                                            <StatIcon className="w-4 h-4" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-2xl font-bold">{stat.value}</div>
                                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            {/* Custom Content */}
            {children && (
                <>
                    <Separator />
                    {children}
                </>
            )}
        </div>
    )
}
