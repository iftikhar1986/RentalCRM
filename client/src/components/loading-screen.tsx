import { Car } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center transition-opacity duration-300">
      <div className="text-center animate-in fade-in duration-500">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mr-4 animate-pulse">
            <Car className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Q-Mobility</h1>
            <p className="text-sm text-gray-600">Internal Lead Management</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        <p className="text-sm text-gray-500 mt-4 animate-pulse">Authenticating...</p>
      </div>
    </div>
  );
}