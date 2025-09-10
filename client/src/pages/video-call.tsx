import { useRoute } from 'wouter';
import VideoCall from '@/components/video-call';

export default function VideoCallPage() {
  const [, params] = useRoute('/video-call/:sessionId');
  const sessionId = params?.sessionId || '';

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Invalid Session</h1>
          <p className="text-slate-600">Please provide a valid session ID</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <VideoCall 
        sessionId={sessionId} 
        sessionTitle="Live Session"
        isHost={false}
      />
    </div>
  );
}
