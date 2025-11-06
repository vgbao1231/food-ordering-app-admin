'use client';

import { FileUpload } from '@/components/ui/file-upload';
import { useState, useEffect } from 'react'; // ⬅️ Thêm useEffect
import axios from 'axios';
import { RefreshCcw } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const API_URL = 'http://localhost:8000/generate-caption-from-image';
const API_URL_1 = 'http://127.0.0.1:8000/caption';

const FoodCaptioner = () => {
  // Trạng thái file ảnh
  const [img, setImg] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');
  // Trạng thái loading
  const [loading, setLoading] = useState(false);
  // Trạng thái lưu trữ toàn bộ data từ API
  const [captionData, setCaptionData] = useState<any>(null);
  // Trạng thái lưu trữ index của mô tả đang hiển thị
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0);
  // ⬅️ TRẠNG THÁI MỚI: Nội dung mô tả đang được chỉnh sửa
  const [editableCaption, setEditableCaption] = useState('');

  // --- useEffect để đồng bộ mô tả ---
  // Mỗi khi `currentCaptionIndex` hoặc `captionData` thay đổi, cập nhật `editableCaption`
  useEffect(() => {
    if (captionData?.descriptions) {
      const newCaption = captionData.descriptions[currentCaptionIndex] || '';
      setEditableCaption(newCaption);
    }
  }, [currentCaptionIndex, captionData]);

  // --- Hàm Gửi Ảnh và Gọi API ---
  const handleSubmit = async (file: File) => {
    if (!file) return;

    setLoading(true);
    setCaptionData(null);
    setCurrentCaptionIndex(0);
    setEditableCaption('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('top_k', '3');

    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      setCaptionData(data);

      // Chọn một index ngẫu nhiên để hiển thị mô tả đầu tiên
      const randomIndex = Math.floor(Math.random() * data.descriptions.length);
      setCurrentCaptionIndex(randomIndex);
    } catch (error) {
      console.error('Lỗi khi gọi API phân loại món ăn:', error);
      setCaptionData({
        error:
          'Không thể phân tích ảnh. Vui lòng kiểm tra console hoặc API Python.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUrl = async (url: string) => {
    setLoading(true);
    setCaptionData(null);
    setCurrentCaptionIndex(0);
    setEditableCaption('');

    try {
      const response = await axios.post(API_URL_1, null, {
        params: { url: url },
      });

      console.log(response);

      const data = response.data.caption_vi;
      setEditableCaption(data);
    } catch (error) {
      console.error('Lỗi khi gọi API phân loại món ăn:', error);
      setCaptionData({
        error:
          'Không thể phân tích ảnh. Vui lòng kiểm tra console hoặc API Python.',
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Hàm Random Mô Tả ---
  const handleRandomCaption = () => {
    if (!captionData || !captionData.descriptions) return;

    const totalDescriptions = captionData.descriptions.length;
    if (totalDescriptions <= 1) return;

    let newIndex = currentCaptionIndex;
    // Lặp cho đến khi chọn được index mới khác index hiện tại
    while (newIndex === currentCaptionIndex) {
      newIndex = Math.floor(Math.random() * totalDescriptions);
    }
    setCurrentCaptionIndex(newIndex);
  };

  // --- Logic hiển thị ---
  const prediction = captionData?.best_prediction;
  const isError = captionData?.error;
  const previewUrl = img ? URL.createObjectURL(img) : null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Test</CardTitle>
          <CardDescription>Test</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-row gap-12">
          <div className="flex flex-col items-center p-8 max-w-2xl mx-auto">
            <div className="w-full">
              <FileUpload
                label="Ảnh Món Ăn"
                value={img}
                onChange={(file) => {
                  setImg(file);
                  if (file) {
                    handleSubmit(file);
                  }
                }}
              />
            </div>

            {/* Hiển thị Loading (Spinner đơn giản) */}
            {loading && (
              <p className="mt-4 text-white flex items-center">
                <RefreshCcw className="animate-spin w-4 h-4 mr-2" /> Đang phân
                tích và sinh mô tả...
              </p>
            )}

            {/* Hiển thị Kết quả */}
            {captionData && !loading && (
              <div className="mt-6 p-4 bg-gray-800/80 rounded-lg w-full text-left shadow-lg">
                {/* Hiển thị Lỗi nếu có */}
                {isError && (
                  <p className="text-red-400 font-medium">{isError}</p>
                )}

                {/* Hiển thị kết quả chính */}
                {prediction && (
                  <>
                    <h3 className="text-2xl font-bold text-green-400 mb-2">
                      ✅ {prediction.label}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Độ tin cậy: **{Math.round(prediction.score * 10000) / 100}
                      %**
                    </p>

                    <h4 className="mt-4 text-lg font-semibold text-white flex items-center justify-between border-t border-gray-700 pt-3">
                      Mô tả Gợi ý (Có thể chỉnh sửa):
                      {/* Nút Random Mô Tả */}
                      {captionData.descriptions.length > 1 && (
                        <button
                          onClick={handleRandomCaption}
                          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition flex items-center text-sm font-normal"
                          title="Tạo mô tả mới"
                        >
                          <RefreshCcw className="w-4 h-4 mr-1" />
                          Mô tả khác
                        </button>
                      )}
                    </h4>

                    {/* ⬅️ THAY THẾ P BẰNG TEXTAREA */}
                    <textarea
                      value={editableCaption}
                      onChange={(e) => setEditableCaption(e.target.value)}
                      rows={8}
                      className="w-full mt-2 p-3 bg-gray-900 border border-gray-700 rounded text-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
                      placeholder="Nhập mô tả của bạn vào đây..."
                    />

                    {/* Nút lưu/copy mô tả (Optional) */}
                    <div className="mt-3 text-right">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Sao chép
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Test</CardTitle>
          <CardDescription>Test</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-row gap-12">
          <div className="flex flex-col items-center p-8 max-w-2xl mx-auto">
            <div className="w-full">
              <Input
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  handleSubmitUrl(e.target.value);
                }}
                placeholder="Url..."
              />
            </div>

            {/* Hiển thị Loading (Spinner đơn giản) */}
            {loading && (
              <p className="mt-4 text-white flex items-center">
                <RefreshCcw className="animate-spin w-4 h-4 mr-2" /> Đang phân
                tích và sinh mô tả...
              </p>
            )}

            {/* Hiển thị Kết quả */}
            <textarea
              value={editableCaption}
              onChange={(e) => setEditableCaption(e.target.value)}
              rows={8}
              className="w-full mt-2 p-3 bg-gray-900 border border-gray-700 rounded text-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
              placeholder="Nhập mô tả của bạn vào đây..."
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default FoodCaptioner;
