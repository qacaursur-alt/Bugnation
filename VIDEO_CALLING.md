# Video Calling Feature

## Overview
This project now includes a free, self-hosted video calling solution using WebRTC and Socket.io. No external services or API keys are required.

## Features
- **Free and Self-Hosted**: Uses WebRTC for peer-to-peer video calls
- **Real-time Communication**: Socket.io for signaling and room management
- **Easy Integration**: Seamlessly integrated with live sessions
- **Cross-Platform**: Works on all modern browsers
- **No External Dependencies**: No need for Google Meet, Zoom, or other services

## How It Works

### For Hosts (Tutors/Admins)
1. Go to Course Management → Live Sessions
2. Click "Start Video Call" to create a new video session
3. Share the room code with participants
4. Start the call and wait for participants to join

### For Participants (Students)
1. Click the video call button on any live session
2. Allow camera and microphone permissions
3. Join the call automatically

## Technical Implementation

### Frontend Components
- `VideoCall` component: Main video calling interface
- `VideoCallPage`: Route handler for video calls
- Integration with `CourseManagementSimple` for live sessions

### Backend
- Socket.io server for real-time signaling
- WebRTC peer-to-peer connections
- Room management and user tracking

### Dependencies
- `simple-peer`: WebRTC peer connection library
- `socket.io-client`: Client-side Socket.io
- `socket.io`: Server-side Socket.io

## Usage

### Starting a Video Call
```typescript
// Generate a unique session ID
const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Open video call in new tab
window.open(`/video-call/${sessionId}`, '_blank');
```

### Joining a Video Call
Navigate to `/video-call/{sessionId}` where `{sessionId}` is the room identifier.

## Browser Requirements
- Modern browser with WebRTC support
- HTTPS required for production (HTTP works for localhost development)
- Camera and microphone permissions

## Security Notes
- All video calls are peer-to-peer (no server recording)
- Room codes are generated client-side
- No persistent storage of call data
- CORS configured for localhost development

## Future Enhancements
- Screen sharing
- Chat during calls
- Call recording (with user consent)
- Multiple participants (currently supports 2)
- Call quality indicators
- Mobile app support
