import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/types/product";
import FavoriteButton from "@/components/FavoriteButton";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative flex flex-col justify-between rounded-lg border p-3 transition hover:shadow-md bg-white">
      <div>
        <div className="relative aspect-square w-full overflow-hidden rounded bg-gray-100">
          <Link
            href={`/products/${product.id}`}
            className="block size-full"
            tabIndex={-1}
            aria-hidden="true"
          >
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <div className="absolute right-2 top-2 z-10">
            <FavoriteButton productId={product.id} size="sm" />
          </div>
        </div>
        <h2 className="mt-2 line-clamp-2 font-medium">
          <Link
            href={`/products/${product.id}`}
            className="hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
          >
            {product.title}
          </Link>
        </h2>
      </div>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="font-semibold">${product.price}</span>
        <span className="flex items-center gap-1">
          <Star
            className="size-4 fill-yellow-400 text-yellow-400"
            aria-hidden="true"
          />
          {product.rating}
        </span>
      </div>
    </div>
  );
}
