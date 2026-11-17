import Image from "next/image";
import { Star } from "lucide-react";
import type { Product } from "@/types/product";
import BackButton from "@/components/BackButton";
import FavoriteButton from "@/components/FavoriteButton";

export default function ProductDetail({ product }: { product: Product }) {
  return (
    <main className="mx-auto w-full max-w-4xl p-4">
      <BackButton />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded bg-gray-100">
          <Image
            src={product.images[0] ?? product.thumbnail}
            alt={product.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain"
            priority
          />
          <div className="absolute right-3 top-3 z-10">
            <FavoriteButton productId={product.id} size="md" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="w-fit rounded bg-gray-200 px-2 py-0.5 text-sm capitalize">
              {product.category}
            </span>
            <FavoriteButton productId={product.id} size="lg" showLabel />
          </div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-s font-medium text-blue-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-2xl font-semibold">${product.price}</p>
          <span className="flex items-center gap-1">
            <Star
              className="size-4 fill-yellow-400 text-yellow-400"
              aria-hidden="true"
            />
            {product.rating}
          </span>
          <p className="text-gray-700">{product.description}</p>
        </div>
      </div>
    </main>
  );
}
