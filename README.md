# ค้นหาสินค้า (Next.js App Router)

แอปดูรายการสินค้าจาก [DummyJSON](https://dummyjson.com/products) ทำเป็นโจทย์ฝึกงาน
ใช้ Next.js (App Router), TypeScript, Tailwind CSS

## วิธีรัน

```bash
npm install
npm run dev
```

เปิด http://localhost:3000 (จะ redirect ไป `/products`)

ไลบรารีที่ใช้เพิ่มจากโจทย์: `lucide-react` (ไอคอน), `framer-motion` (แอนิเมชันปุ่มกลับ)

## โครงสร้าง

```
src/
├─ app/products/page.tsx        หน้า list (Server Component ห่อ Suspense)
├─ app/products/[id]/page.tsx   หน้า detail
├─ components/                  UI ล้วน
├─ hooks/                       custom hooks (logic ทั้งหมด)
└─ lib/products.ts              ฟังก์ชันล้วน (สร้าง URL, เรียงราคา)
```

หลักการ: component ทำหน้าที่แสดงผล ส่วน logic อยู่ใน custom hook และฟังก์ชันล้วน

## Hook ที่ใช้และเหตุผล

| Hook              | ใช้ที่ไหน                                                     | ทำไม                                                                                                  |
| ----------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `useState`        | `useFetch`, `useDebounce`, `useProductSearch`                 | เก็บ data/loading/error, ค่าที่ debounce แล้ว และข้อความในช่องค้นหา                                   |
| `useEffect`       | `useFetch`, `useDebounce`, `useAutoFocus`, `useProductSearch` | ดึงข้อมูลเมื่อ URL เปลี่ยน, ตั้ง/ล้าง timer, focus ตอน mount, เขียน q ลง URL                          |
| `useRef`          | `useAutoFocus`                                                | อ้างอิง input เพื่อ `.focus()` โดยไม่ทำให้ re-render                                                  |
| `useMemo`         | `useProductSearch`                                            | เรียงราคาฝั่ง client จาก `data` + `sort` โดยไม่ยิง API ใหม่ และคำนวณใหม่เมื่อสองค่านี้เปลี่ยนเท่านั้น |
| `useCallback`     | `useProductSearch`, `useQueryParams`, `useProductDetail`      | ดูหัวข้อด้านล่าง                                                                                      |
| `useSearchParams` | `useQueryParams`                                              | อ่าน `q` และ `sort` จาก URL ทำให้ refresh/ส่งลิงก์แล้วได้ผลเดิม (ห่อ `<Suspense>` ที่ `page.tsx`)     |
| `useRouter`       | `useQueryParams`, `useProductDetail`                          | `router.replace` อัปเดต URL โดยไม่เพิ่ม history, `router.back()` ในหน้า detail                        |
| `usePathname`     | `useQueryParams`                                              | สร้าง URL ใหม่โดยคง path เดิม                                                                         |
| `useParams`       | `useProductDetail`                                            | อ่าน `id` จาก `/products/[id]`                                                                        |

### Custom hooks

- `useFetch(url)` คืน `{ data, loading, error }` ใช้ทั้งสองหน้า ใช้ `AbortController` ยกเลิก request เก่าเมื่อ url เปลี่ยน เพื่อกัน race condition (ไม่แสดง `AbortError` เป็น error) และเช็ก `res.ok` เพราะ `fetch` ไม่ throw เมื่อได้ 404/500
- `useDebounce(value, delay)` ค่าจะอัปเดตเมื่อหยุดเปลี่ยนครบ `delay` (500ms)
- `useAutoFocus` ส่ง ref กลับมา focus ช่องค้นหาตอนโหลดหน้า
- `useQueryParams` อ่าน/เขียน URL ที่เดียว
- `useProductSearch` รวม logic ทั้งหน้า list
- `useProductDetail` ดึงสินค้าจาก id และจัดการปุ่มกลับ

## ทำไมใช้ `useCallback`

ฟังก์ชันที่สร้างใน component จะได้อ้างอิงใหม่ทุกครั้งที่ render ถ้าส่งลง child ที่ห่อ `React.memo` (`SearchBar`, `SortSelect`) child จะเห็นว่า prop เปลี่ยนและ render ใหม่ทุกครั้ง
`useCallback` ทำให้อ้างอิงคงเดิมจนกว่า dependency จะเปลี่ยน ทำให้ `memo` ข้ามการ render ได้
(ทดสอบแล้ว: พิมพ์ในช่องค้นหา `SortSelect` ไม่ render ซ้ำ)

## การตัดสินใจออกแบบ

- `sort` อ่านจาก URL อย่างเดียว ไม่มี state แยก เพื่อไม่ให้ข้อมูลสองที่ไม่ตรงกัน ค่าที่ไม่ถูกต้อง (เช่น `?sort=abc`) ถือเหมือนไม่มี sort
- `q` มี state สำหรับช่องพิมพ์ (ให้ตอบสนองทันที) แล้วเขียนลง URL หลัง debounce 500ms
- ใช้ `router.replace` ไม่ใช่ `push` เพื่อไม่ให้พิมพ์ทีละคำสร้าง history
- `"use client"` ใส่เฉพาะไฟล์ที่เป็นขอบเขตจาก Server Component (`ProductsContent`, `ProductDetail`) ส่วน hook/component ลูกถูก import จาก client อยู่แล้ว

## ข้อจำกัดที่ทราบ

- ปุ่ม "กลับ" ใช้ `router.back()` ถ้ามี history ถ้าเปิดหน้า detail ตรงๆ จะไปที่ `/products` แต่ถ้าเปิดลิงก์มาจากเว็บอื่นในแท็บเดิม จะกลับไปเว็บนั้น (ตรวจจาก `history.length` เป็นการประมาณ)
- ระหว่างค้นหาใหม่ จะเห็นรายการเก่าพร้อมข้อความโหลดจนกว่าผลใหม่จะมา

## Bonus

ยังไม่ได้ทำ (pagination, favorite + `useLocalStorage`, detail เป็น Server Component)
