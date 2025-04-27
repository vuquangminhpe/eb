import { Loader2 } from "lucide-react"

// Mock product data
const mockProducts = [
  {
    id: 1,
    title: "Brown Leather Bag",
    description: "Lorem ipsum dolor sit amet",
    price: 2500,
    url: "https://picsum.photos/id/7",
  },
  {
    id: 2,
    title: "School Books",
    description: "Lorem ipsum dolor sit amet",
    price: 1999,
    url: "https://picsum.photos/id/20",
  },
  {
    id: 3,
    title: "Vintage Camera",
    description: "Lorem ipsum dolor sit amet",
    price: 3999,
    url: "https://picsum.photos/id/250",
  },
  {
    id: 4,
    title: "Modern Watch",
    description: "Lorem ipsum dolor sit amet",
    price: 4500,
    url: "https://picsum.photos/id/40",
  },
  {
    id: 5,
    title: "Headphones",
    description: "Lorem ipsum dolor sit amet",
    price: 1500,
    url: "https://picsum.photos/id/50",
  },
]

function ProductCard({ product }) {
  return (
    <div className="border rounded-lg hover:shadow-lg transition-shadow">
      <a href={`/product/${product.id}`}>
        <div className="w-full">
          <img src={`${product.url}/200`} alt={product.title} className="w-full h-[200px] object-cover rounded-t-lg" />
        </div>

        <div className="p-2">
          <div className="font-semibold hover:text-blue-600 truncate">{product.title}</div>
          <div className="text-sm text-gray-500 truncate">{product.description}</div>
          <div className="font-bold text-lg">£{(product.price / 100).toFixed(2)}</div>
        </div>
      </a>
    </div>
  )
}

export default function SimilarProducts() {
  const isLoading = false // For demo purposes

  return (
    <div>
      <div className="border-b py-1 max-w-[1200px] mx-auto" />

      <div className="max-w-[1200px] mx-auto">
        <div className="font-bold text-2xl py-2 mt-4">Similar sponsored items</div>

        {!isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center gap-4 font-semibold">
              <Loader2 size={30} className="text-blue-400 animate-spin" />
              Loading Products...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

