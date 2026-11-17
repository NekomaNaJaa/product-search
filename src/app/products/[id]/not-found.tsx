import BackButton from "@/components/BackButton";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-4xl p-4">
      <BackButton />
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800">ไม่พบสินค้าที่ต้องการ</h2>
        <p className="mt-2 text-gray-500">
          สินค้าที่คุณกำลังค้นหาอาจถูกลบหรือไม่มีอยู่ในระบบ
        </p>
      </div>
    </main>
  );
}
