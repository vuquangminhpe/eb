import React from "react";
import { FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";

const ProductList = ({
  products,
  showDetailModal,
  showAddEditModal,
  confirmAction,
  currentPage,
  itemsPerPage,
}) => {
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sản phẩm
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giá
            </th>

            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedProducts.map((product) => (
            <tr key={product.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded object-cover"
                      src={product.imageURL || "https://via.placeholder.com/40"}
                      alt={product.title}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.category}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${product.price}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => showDetailModal("product", product.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => showAddEditModal("product", product)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => confirmAction("deleteProduct", product.id)}
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

export default ProductList;
