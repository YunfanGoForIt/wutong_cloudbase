// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Textarea, useToast } from '@/components/ui';
// @ts-ignore;
import { Trash2, Save, X } from 'lucide-react';

export default function EditDiaryPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [content, setContent] = useState('');
  const [isNew, setIsNew] = useState(true);
  const [loading, setLoading] = useState(false);
  const [diaryId, setDiaryId] = useState('');
  useEffect(() => {
    // 从路由参数获取编辑的日记ID
    const diaryId = $w.page.dataset.params?.diaryId;
    if (diaryId) {
      setIsNew(false);
      setDiaryId(diaryId);
      fetchDiaryContent(diaryId);
    }
  }, [$w.page.dataset.params]);
  const fetchDiaryContent = async diaryId => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'diary_content',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: diaryId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      if (result) {
        setContent(result.content || '');
      }
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
  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: '保存失败',
        description: '日记内容不能为空',
        variant: 'destructive'
      });
      return;
    }
    try {
      setLoading(true);
      const roomId = localStorage.getItem('currentRoom');
      if (isNew) {
        // 新增日记
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'diary_content',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              roomId,
              type: 'text',
              author: $w.auth.currentUser?.name || '匿名',
              content: content.trim()
            }
          }
        });
        toast({
          title: '保存成功',
          description: '日记已创建'
        });
      } else {
        // 更新日记
        await $w.cloud.callDataSource({
          dataSourceName: 'diary_content',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              content: content.trim()
            },
            filter: {
              where: {
                _id: {
                  $eq: diaryId
                }
              }
            }
          }
        });
        toast({
          title: '保存成功',
          description: '日记已更新'
        });
      }
      $w.utils.navigateBack();
    } catch (error) {
      toast({
        title: '保存失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    if (confirm('确定要删除这篇日记吗？')) {
      try {
        setLoading(true);
        await $w.cloud.callDataSource({
          dataSourceName: 'diary_content',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: diaryId
                }
              }
            }
          }
        });
        toast({
          title: '删除成功',
          description: '日记已删除'
        });
        $w.utils.navigateBack();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-pink-600">{isNew ? '新建日记' : '编辑日记'}</h2>
          <Button variant="ghost" size="icon" onClick={() => $w.utils.navigateBack()} className="text-gray-500 hover:text-pink-500" disabled={loading}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">内容</label>
          <Textarea value={content} onChange={e => setContent(e.target.value)} className="min-h-[160px]" disabled={loading} />
        </div>
        
        <div className="flex justify-between">
          {!isNew && <Button variant="outline" onClick={handleDelete} className="border-red-500 text-red-500 hover:bg-red-50" disabled={loading}>
            <Trash2 className="mr-2 h-4 w-4" /> 删除
          </Button>}
          <Button onClick={handleSave} className="bg-pink-500 hover:bg-pink-600" disabled={loading}>
            {loading ? <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                保存中...
              </div> : <>
                <Save className="mr-2 h-4 w-4" /> 保存
              </>}
          </Button>
        </div>
      </div>
    </div>;
}