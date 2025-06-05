'use client';

import { useState, useEffect } from 'react';
import { FaFilter, FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaTag } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  select: 'idPlace' | 'date' | 'status' | 'all';
  lookup: string;
}

export default function Filter({ onFilterChange }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    select: 'all',
    lookup: ''
  });

  // Lấy giá trị từ URL
  useEffect(() => {
    const select = searchParams.get('select');
    const lookup = searchParams.get('lookup');
    
    if (select && lookup) {
      setFilterOptions({
        select: select as FilterOptions['select'], 
        lookup
      });
    }
  }, [searchParams]);

  // Xử lý khi giá trị filter thay đổi
  const handleFilterChange = (field: keyof FilterOptions, value: string) => {
    const newOptions = { ...filterOptions, [field]: value };
    setFilterOptions(newOptions);
  };

  // Áp dụng filter
  const applyFilter = () => {
    onFilterChange(filterOptions);
    setIsExpanded(false);
    
    // Cập nhật URL
    const params = new URLSearchParams();
    if (filterOptions.select !== 'all') {
      params.set('select', filterOptions.select);
      params.set('lookup', filterOptions.lookup);
      router.push(`?${params.toString()}`);
    } else {
      router.push('');
    }
  };

  // Xóa filter
  const clearFilter = () => {
    const newOptions: FilterOptions = { select: 'all', lookup: '' };
    setFilterOptions(newOptions);
    onFilterChange(newOptions);
    router.push('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaFilter className="text-cyan-600" />
          <h3 className="font-medium">Lọc đặt chỗ</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-cyan-600 hover:text-cyan-700"
        >
          {isExpanded ? 'Thu gọn' : 'Mở rộng'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {/* Chọn tiêu chí lọc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lọc theo
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => handleFilterChange('select', 'all')}
                className={`flex items-center justify-center py-2 px-4 rounded-md ${
                  filterOptions.select === 'all' 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <FaSearch className="mr-1" />
                <span>Tất cả</span>
              </button>
              <button
                onClick={() => handleFilterChange('select', 'idPlace')}
                className={`flex items-center justify-center py-2 px-4 rounded-md ${
                  filterOptions.select === 'idPlace' 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <FaMapMarkerAlt className="mr-1" />
                <span>Địa điểm</span>
              </button>
              <button
                onClick={() => handleFilterChange('select', 'date')}
                className={`flex items-center justify-center py-2 px-4 rounded-md ${
                  filterOptions.select === 'date' 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <FaCalendarAlt className="mr-1" />
                <span>Ngày</span>
              </button>
              <button
                onClick={() => handleFilterChange('select', 'status')}
                className={`flex items-center justify-center py-2 px-4 rounded-md ${
                  filterOptions.select === 'status' 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <FaTag className="mr-1" />
                <span>Trạng thái</span>
              </button>
            </div>
          </div>

          {/* Nhập giá trị tìm kiếm */}
          {filterOptions.select !== 'all' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filterOptions.select === 'idPlace' && 'Mã địa điểm'}
                {filterOptions.select === 'date' && 'Ngày (DD/MM/YYYY)'}
                {filterOptions.select === 'status' && 'Trạng thái'}
              </label>

              {filterOptions.select === 'status' ? (
                <select
                  value={filterOptions.lookup}
                  onChange={(e) => handleFilterChange('lookup', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">-- Chọn trạng thái --</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="PENDING">Đang chờ xác nhận</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              ) : filterOptions.select === 'date' ? (
                <input
                  type="date"
                  value={filterOptions.lookup}
                  onChange={(e) => handleFilterChange('lookup', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              ) : (
                <input
                  type="text"
                  placeholder={`Nhập ${filterOptions.select === 'idPlace' ? 'mã địa điểm' : 'giá trị tìm kiếm'}...`}
                  value={filterOptions.lookup}
                  onChange={(e) => handleFilterChange('lookup', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              )}
            </div>
          )}

          {/* Các nút tác vụ */}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={clearFilter}
              className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={applyFilter}
              disabled={filterOptions.select !== 'all' && !filterOptions.lookup}
              className="py-2 px-4 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}