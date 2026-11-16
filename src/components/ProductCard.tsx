import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/types/product";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="block rounded-lg border p-3 transition hover:shadow-md bg-white"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded bg-gray-100">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain"
        />
      </div>
      <h2 className="mt-2 line-clamp-2 font-medium">{product.title}</h2>
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
    </Link>
  );
}
