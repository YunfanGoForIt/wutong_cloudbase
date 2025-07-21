// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { LogOut, Edit, Camera } from 'lucide-react';

export default function RoomPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [roomId, setRoomId] = useState('');
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  useEffect(() => {
    // 检查用户是否登录
    if (!$w.auth.currentUser) {
      toast({
        title: '请先登录',
        description: '您需要登录后才能访问房间',
        variant: 'destructive'
      });
      $w.utils.redirectTo({
        pageId: 'index'
      });
      return;
    }

    // 获取用户信息和房间信息
    const fetchUserAndRoom = async () => {
      try {
        setLoading(true);
        // 获取用户信息
        const userResult = await $w.cloud.callDataSource({
          dataSourceName: 'user',
          methodName: 'wedaGetItemV2',
          params: {
            filter: {
              where: {
                email: {
                  $eq: $w.auth.currentUser.email
                }
              }
            },
            select: {
              $master: true
            }
          }
        });
        if (!userResult) {
          toast({
            title: '错误',
            description: '用户信息不存在',
            variant: 'destructive'
          });
          $w.utils.redirectTo({
            pageId: 'index'
          });
          return;
        }
        setUserInfo(userResult);
        const currentRoomId = userResult.roomId || $w.page.dataset.params?.roomId || '';
        if (!currentRoomId) {
          toast({
            title: '错误',
            description: '您尚未绑定任何房间',
            variant: 'destructive'
          });
          $w.utils.redirectTo({
            pageId: 'index'
          });
          return;
        }
        setRoomId(currentRoomId);
        localStorage.setItem('currentRoom', currentRoomId);

        // 获取房间内容
        const roomResult = await $w.cloud.callDataSource({
          dataSourceName: 'diary_content',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                roomId: {
                  $eq: currentRoomId
                }
              }
            },
            select: {
              $master: true
            },
            getCount: true,
            pageSize: 100
          }
        });
        setContents(roomResult.records || []);
      } catch (error) {
        toast({
          title: '加载失败',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndRoom();
  }, [$w.auth.currentUser, $w.page.dataset.params]);
  const handleLeaveRoom = async () => {
    try {
      setLoading(true);
      // 更新用户房间信息
      await $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            roomId: ''
          },
          filter: {
            where: {
              email: {
                $eq: $w.auth.currentUser.email
              }
            }
          }
        }
      });
      localStorage.removeItem('currentRoom');
      $w.utils.redirectTo({
        pageId: 'index'
      });
    } catch (error) {
      toast({
        title: '操作失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAddText = () => {
    $w.utils.navigateTo({
      pageId: 'edit-diary'
    });
  };
  const handleAddPhoto = () => {
    $w.utils.navigateTo({
      pageId: 'upload-photo'
    });
  };
  const handleDeleteContent = async id => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'diary_content',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: id
              }
            }
          }
        }
      });
      setContents(contents.filter(item => item._id !== id));
      toast({
        title: '删除成功',
        description: '内容已删除'
      });
    } catch (error) {
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md mx-auto overflow-hidden">
        {/* 顶部导航 */}
        <div className="bg-pink-500 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">房间: {roomId}</h2>
            {userInfo && <p className="text-sm opacity-80">欢迎, {userInfo.username}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={handleLeaveRoom} className="text-white hover:bg-pink-600" disabled={loading}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        
        {/* 内容区域 */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div> : contents.length === 0 ? <div className="text-center py-8 text-gray-500">
              还没有内容，快来添加第一条吧~
            </div> : contents.map(item => <div key={item._id} className="bg-white rounded-lg p-4 mb-4 shadow-md transition-all hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                      ${item.author === '小美' ? 'bg-pink-200 text-pink-600' : 'bg-blue-200 text-blue-600'}`}>
                      {item.author?.charAt(0) || '?'}
                    </div>
                    <span className="ml-2 font-medium">{item.author || '未知用户'}</span>
                  </div>
                  <div className="text-gray-500 text-sm">{new Date(item.createdAt).toLocaleString()}</div>
                </div>
                
                {item.type === 'text' ? <p className="text-gray-700 mt-2">{item.content}</p> : <>
                    <img src={item.content} alt="日记照片" className="w-full h-auto rounded-lg mt-2" />
                    {item.caption && <p className="text-gray-500 text-sm mt-2">{item.caption}</p>}
                  </>}
                
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteContent(item._id)} className="text-gray-500 hover:text-pink-500">
                    删除
                  </Button>
                </div>
              </div>)}
        </div>
        
        {/* 底部操作栏 */}
        <div className="bg-white border-t border-gray-200 p-4 flex justify-around">
          <Button variant="default" size="icon" onClick={handleAddText} className="bg-pink-500 hover:bg-pink-600 text-white rounded-full w-12 h-12">
            <Edit className="h-5 w-5" />
          </Button>
          <Button variant="default" size="icon" onClick={handleAddPhoto} className="bg-pink-500 hover:bg-pink-600 text-white rounded-full w-12 h-12">
            <Camera className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>;
}