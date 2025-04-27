import React from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const CategoryList = ({
  categories,
  showAddEditCategory,
  confirmAction,
  currentPage,
  itemsPerPage,
}) => {
  // Add check to ensure categories is an array
  const categoryArray = Array.isArray(categories) ? categories : [];
  const paginatedCategories = categoryArray.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tên danh mục
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mô tả
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số sản phẩm
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedCategories.map((category) => (
            <tr key={category._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {category.name}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500">
                  {category.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {category.productCount || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      showAddEditCategory({ show: true, data: category })
                    }
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() =>
                      confirmAction("deleteCategory", category._id)
                    }
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryList;
