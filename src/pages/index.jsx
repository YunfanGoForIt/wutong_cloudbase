// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Input, Button, Card, CardHeader, CardTitle, CardContent, CardFooter, useToast } from '@/components/ui';
// @ts-ignore;
import { LogIn, UserPlus, DoorOpen, PlusCircle } from 'lucide-react';

export default function HomePage(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [roomId, setRoomId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const handleAuth = async () => {
    try {
      if (!email || !password) {
        toast({
          title: '错误',
          description: '请输入邮箱和密码',
          variant: 'destructive'
        });
        return;
      }

      // 调用用户数据模型验证登录
      const userResult = await $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              email: {
                $eq: email
              },
              password: {
                $eq: password
              }
            }
          },
          select: {
            $master: true
          },
          pageSize: 1
        }
      });
      if (userResult.records.length === 0) {
        toast({
          title: '错误',
          description: '邮箱或密码不正确',
          variant: 'destructive'
        });
        return;
      }
      setIsLoggedIn(true);
      toast({
        title: '成功',
        description: isLogin ? '登录成功' : '注册成功'
      });
    } catch (error) {
      toast({
        title: '错误',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      toast({
        title: '错误',
        description: '请输入房间ID',
        variant: 'destructive'
      });
      return;
    }
    try {
      // 检查房间是否存在
      const roomResult = await $w.cloud.callDataSource({
        dataSourceName: 'room',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: roomId
              }
            }
          },
          select: {
            $master: true
          },
          pageSize: 1
        }
      });
      if (roomResult.records.length === 0) {
        toast({
          title: '错误',
          description: '房间不存在',
          variant: 'destructive'
        });
        return;
      }

      // 更新用户房间信息
      await $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            roomId: roomId
          },
          filter: {
            where: {
              email: {
                $eq: email
              }
            }
          }
        }
      });
      localStorage.setItem('currentRoom', roomId);
      $w.utils.navigateTo({
        pageId: 'room',
        params: {
          roomId
        }
      });
    } catch (error) {
      toast({
        title: '错误',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const handleCreateRoom = async () => {
    try {
      // 创建新房间
      const roomResult = await $w.cloud.callDataSource({
        dataSourceName: 'room',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            name: '情侣日记房间',
            creator: email
          }
        }
      });

      // 更新用户房间信息
      await $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            roomId: roomResult.id
          },
          filter: {
            where: {
              email: {
                $eq: email
              }
            }
          }
        }
      });
      localStorage.setItem('currentRoom', roomResult.id);
      $w.utils.navigateTo({
        pageId: 'room',
        params: {
          roomId: roomResult.id
        }
      });
    } catch (error) {
      toast({
        title: '错误',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  if (!isLoggedIn) {
    return <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-pink-600">
            {isLogin ? '登录' : '注册'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">邮箱</label>
            <Input id="email" type="email" placeholder="输入邮箱" value={email} onChange={e => setEmail(e.target.value)} className="w-full" />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">密码</label>
            <Input id="password" type="password" placeholder="输入密码" value={password} onChange={e => setPassword(e.target.value)} className="w-full" />
          </div>
          <Button onClick={handleAuth} className="w-full bg-pink-500 hover:bg-pink-600">
            {isLogin ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
            {isLogin ? '登录' : '注册'}
          </Button>
          <div className="text-center text-sm text-gray-600">
            {isLogin ? '没有账号？' : '已有账号？'}
            <button onClick={() => setIsLogin(!isLogin)} className="ml-1 text-pink-500 hover:text-pink-600 font-medium">
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-pink-600">情侣日记</CardTitle>
        <p className="text-center text-gray-600 mt-2">与爱人共享美好时光</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
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
      </CardContent>
      <CardFooter className="justify-center">
        <button onClick={() => setIsLoggedIn(false)} className="text-sm text-pink-500 hover:text-pink-600 font-medium">
          退出登录
        </button>
      </CardFooter>
    </Card>
  </div>;
}