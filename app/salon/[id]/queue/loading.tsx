export default function Loading() {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-gray-50">
        {/* Header skeleton */}
        <div className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-black/20 p-2 rounded-full">
              <div className="h-5 w-5 bg-white/50 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="h-5 w-32 bg-white/50 rounded-full animate-pulse mb-1" />
              <div className="h-3 w-24 bg-white/30 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="bg-white/20 p-2 rounded-full">
              <div className="h-5 w-5 bg-white/50 rounded-full animate-pulse" />
            </div>
            <div className="bg-white/20 p-2 rounded-full">
              <div className="h-5 w-5 bg-white/50 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
  
        <div className="p-4">
          {/* Search bar skeleton */}
          <div className="h-10 bg-white rounded-md animate-pulse mb-4" />
  
          {/* Last updated skeleton */}
          <div className="flex justify-between items-center mb-4">
            <div className="h-4 w-40 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-amber-100 rounded-full animate-pulse" />
          </div>
  
          {/* Queue items skeletons */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            </div>
  
            <div className="space-y-3">
              <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
  
        {/* Bottom button skeleton */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div className="h-12 bg-amber-300 rounded-full animate-pulse" />
        </div>
      </div>
    )
  }
  