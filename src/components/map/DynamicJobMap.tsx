"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const JobMap = dynamic(() => import("./JobMap").then((mod) => mod.JobMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-muted rounded-lg flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

export { JobMap }
