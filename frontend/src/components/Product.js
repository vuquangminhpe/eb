import { Link } from "react-router-dom";

export default function Product({ product }) {
  return (
    <>
      <Link
        to={`/product/${product?.id}`}
        className="max-w-[200px] p-1.5 border border-gray-50 hover:border-gray-200 hover:shadow-xl bg-gray-100 rounded mx-auto"
      >
        {product?.url ? (
          <div className="relative">
            <img
              className="rounded cursor-pointer"
              src={product.url + "/190"}
              alt={product.title}
            />
            {product.status === "unavailable" && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                Sold Out
              </div>
            )}
          </div>
        ) : null}

        <div className="pt-2 px-1">
          <div className="font-semibold text-[15px] hover:underline cursor-pointer">
            {product?.title}
          </div>
          <div className="font-extrabold">
            £{(product?.price / 100).toFixed(2)}
          </div>

          <div className="relative flex items-center text-[12px] text-gray-500">
            <div className="line-through">
              £{((product?.price * 1.2) / 100).toFixed(2)}
            </div>
            <div className="px-2">-</div>
            <div className="line-through">20%</div>
          </div>
          
          {/* Category badge */}
          <div className="mt-1 inline-block bg-gray-200 rounded-full px-2 py-0.5 text-xs">
            Category: {product.categoryId}
          </div>
        </div>
      </Link>
    </>
  );
}