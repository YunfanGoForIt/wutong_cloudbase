// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Input, Button } from '@/components/ui';
// @ts-ignore;
import { DoorOpen, PlusCircle } from 'lucide-react';

export default function HomePage(props) {
  const [roomId, setRoomId] = useState('');
  const {
    $w
  } = props;
  const handleJoinRoom = () => {
    if (roomId.trim()) {
      localStorage.setItem('currentRoom', roomId);
      $w.utils.navigateTo({
        pageId: 'room',
        params: {
          roomId
        }
      });
    } else {
      alert('请输入房间ID');
    }
  };
  const handleCreateRoom = () => {
    const newRoomId = 'room-' + Math.random().toString(36).substr(2, 8);
    localStorage.setItem('currentRoom', newRoomId);
    $w.utils.navigateTo({
      pageId: 'room',
      params: {
        roomId: newRoomId
      }
    });
  };
  return <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-600">情侣日记</h1>
          <p className="text-gray-600 mt-2">与爱人共享美好时光</p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="roomId" className="block text-gray-700 font-medium mb-2">房间ID</label>
          <Input id="roomId" placeholder="输入房间ID" value={roomId} onChange={e => setRoomId(e.target.value)} className="w-full" />
        </div>
        
        <div className="flex flex-col space-y-4">
          <Button onClick={handleJoinRoom} className="bg-pink-500 hover:bg-pink-600">
            <DoorOpen className="mr-2 h-4 w-4" /> 加入房间
          </Button>
          <Button onClick={handleCreateRoom} variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50">
            <PlusCircle className="mr-2 h-4 w-4" /> 创建新房间
          </Button>
        </div>
      </div>
    </div>;
}