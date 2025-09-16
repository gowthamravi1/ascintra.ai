import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ChatLoading() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="glass dark:glass-dark border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* AI Message */}
          <div className="flex space-x-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <Card className="flex-1 max-w-2xl">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>

          {/* User Message */}
          <div className="flex space-x-3 justify-end">
            <Card className="max-w-2xl">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          </div>

          {/* AI Message */}
          <div className="flex space-x-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <Card className="flex-1 max-w-2xl">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Input Area */}
        <div className="glass dark:glass-dark border-t p-4">
          <div className="flex space-x-3">
            <Skeleton className="flex-1 h-10" />
            <Skeleton className="h-10 w-10" />
          </div>
          <div className="flex space-x-2 mt-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 glass dark:glass-dark border-l p-4 space-y-4">
        <div>
          <Skeleton className="h-6 w-32 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        <div>
          <Skeleton className="h-6 w-28 mb-3" />
          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <Skeleton className="h-6 w-36 mb-3" />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
