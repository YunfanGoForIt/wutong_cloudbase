// @ts-ignore;
import React, { useState, useCallback } from 'react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, X, Trash2 } from 'lucide-react';

export default function UploadPhotoPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const handleFileChange = useCallback(e => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.match('image.*')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = event => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);
  const handleDrop = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.match('image.*')) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = event => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(droppedFile);
    }
  }, []);
  const handleDragOver = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const handleUpload = async () => {
    if (!file) return;
    try {
      setLoading(true);
      const roomId = localStorage.getItem('currentRoom');
      // 先上传图片到云存储
      const uploadResult = await $w.cloud.getCloudInstance().then(tcb => tcb.uploadFile({
        cloudPath: `diary_photos/${Date.now()}_${file.name}`,
        filePath: file
      }));
      // 获取图片URL
      const fileUrl = await $w.cloud.getCloudInstance().then(tcb => tcb.getTempFileURL({
        fileList: [uploadResult.fileID]
      })).then(res => res.fileList[0].tempFileURL);
      // 保存到数据模型
      await $w.cloud.callDataSource({
        dataSourceName: 'diary_content',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            roomId,
            type: 'image',
            author: $w.auth.currentUser?.name || '匿名',
            content: fileUrl,
            caption: caption.trim()
          }
        }
      });
      toast({
        title: '上传成功',
        description: '照片已保存'
      });
      $w.utils.navigateBack();
    } catch (error) {
      toast({
        title: '上传失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    setFile(null);
    setPreview('');
    setCaption('');
  };
  return <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-pink-600">上传照片</h2>
          <Button variant="ghost" size="icon" onClick={() => $w.utils.navigateBack()} className="text-gray-500 hover:text-pink-500" disabled={loading}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {!preview ? <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-colors" onClick={() => document.getElementById('fileInput').click()} onDrop={handleDrop} onDragOver={handleDragOver}>
            <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            <p className="text-gray-500">拖放照片到这里或点击选择</p>
            <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={handleFileChange} />
          </div> : <div className="mb-6">
            <h3 className="font-medium mb-3">预览</h3>
            <img src={preview} alt="预览" className="w-full h-auto rounded-lg mb-4" />
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">描述</label>
              <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="为照片添加描述..." disabled={loading} />
            </div>
          </div>}
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleCancel} disabled={!preview || loading} className="border-gray-300">
            <Trash2 className="mr-2 h-4 w-4" /> 取消
          </Button>
          <Button onClick={handleUpload} disabled={!preview || loading} className="bg-pink-500 hover:bg-pink-600">
            {loading ? <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                上传中...
              </div> : <>
                <Upload className="mr-2 h-4 w-4" /> 上传
              </>}
          </Button>
        </div>
      </div>
    </div>;
}