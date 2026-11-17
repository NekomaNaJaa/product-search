import PageNotFound from "@/components/PageNotFound";

// ใช้เมื่อเรียก notFound() ใน app/products/[id]/page.tsx (เช่น /products/99999)
export default function ProductNotFound() {
  return (
    <PageNotFound
      title="ไม่พบสินค้าที่ต้องการ"
      description="สินค้าที่คุณกำลังค้นหาอาจถูกลบหรือไม่มีอยู่ในระบบ ลองเลือกดูสินค้าอื่นแทน"
    />
  );
}
