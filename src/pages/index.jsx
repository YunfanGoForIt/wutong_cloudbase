// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Input, Button, Card, CardHeader, CardTitle, CardContent, useToast } from '@/components/ui';
// @ts-ignore;
import { LogIn, UserPlus } from 'lucide-react';

export default function HomePage(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
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
      // 1. 调用user数据模型进行验证
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'user',
        // 数据模型名称
        methodName: isLogin ? 'wedaGetRecordsV2' : 'wedaCreateV2',
        params: isLogin ? {
          // 登录查询条件
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
        } : {
          // 注册创建数据
          data: {
            email,
            password,
            createdAt: new Date().getTime()
          }
        }
      });

      // 2. 处理返回结果
      if (isLogin) {
        if (result.records.length === 0) {
          throw new Error('邮箱或密码错误');
        }
        toast({
          title: '登录成功'
        });
      } else {
        toast({
          title: '注册成功'
        });
      }

      // 3. 跳转到房间页面
      $w.utils.navigateTo({
        pageId: 'room',
        params: {
          userId: isLogin ? result.records[0]._id : result.id
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
  return <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-pink-600">
            {isLogin ? '登录' : '注册'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} className="w-full" />
          </div>
          <div>
            <Input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} className="w-full" />
          </div>
          <Button onClick={handleAuth} className="w-full bg-pink-500 hover:bg-pink-600 text-white">
            {isLogin ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
            {isLogin ? '登录' : '注册'}
          </Button>
        </CardContent>
      </Card>
    </div>;
}