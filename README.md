# ค้นหาสินค้า (Next.js App Router)

แอปดูรายการสินค้าจาก [DummyJSON](https://dummyjson.com/products) ทำเป็นโจทย์ฝึกงาน
ใช้ Next.js (App Router), TypeScript, Tailwind CSS

## วิธีรัน

```bash
npm install
npm run dev
```

เปิด http://localhost:3000 (จะ redirect ไป `/products`)

ไลบรารีที่ใช้เพิ่มจากโจทย์:

- `lucide-react` (ไอคอน)
- `framer-motion` (แอนิเมชันปุ่มกลับและ Pagination)
- `shadcn/ui` (ติดตั้งผ่าน CLI: `button`, `pagination`) พร้อม `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`

## โครงสร้าง

```
src/
├─ app/products/page.tsx        หน้า list (Server Component ห่อ Suspense)
├─ app/products/[id]/page.tsx   หน้า detail (Server Component ดึงข้อมูลด้วย async/await)
├─ components/                  UI ล้วน
│  └─ ui/                       คอมโพเนนต์ที่ shadcn CLI สร้าง (button, pagination)
├─ hooks/                       custom hooks (logic ทั้งหมด)
└─ lib/                         ฟังก์ชันล้วน (products.ts) และ cn() (utils.ts)
```

หลักการ: component ทำหน้าที่แสดงผล ส่วน logic อยู่ใน custom hook และฟังก์ชันล้วน (หน้า detail ดึงข้อมูลบน Server โดยตรง)

## Hook ที่ใช้และเหตุผล

| Hook                   | ใช้ที่ไหน                                                     | ทำไม                                                                                                             |
| ---------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `useState`             | `useFetch`, `useDebounce`, `useProductSearch`                 | เก็บ data/loading/error, ค่าที่ debounce แล้ว และข้อความในช่องค้นหา                                              |
| `useEffect`            | `useFetch`, `useDebounce`, `useAutoFocus`, `useProductSearch` | ดึงข้อมูลเมื่อ URL เปลี่ยน, ตั้ง/ล้าง timer, focus ตอน mount, เขียน q ลง URL                                     |
| `useRef`               | `useAutoFocus`                                                | อ้างอิง input เพื่อ `.focus()` โดยไม่ทำให้ re-render                                                             |
| `useMemo`              | `useProductSearch`                                            | เรียงราคาฝั่ง client จาก `data` + `sort` โดยไม่ยิง API ใหม่ และคำนวณใหม่เมื่อสองค่านี้เปลี่ยนเท่านั้น            |
| `useCallback`          | `useProductSearch`, `useQueryParams`                          | ดูหัวข้อด้านล่าง                                                                                                 |
| `useSearchParams`      | `useQueryParams`                                              | อ่าน `q`, `sort` และ `page` จาก URL ทำให้ refresh/ส่งลิงก์แล้วได้ผลเดิม (ห่อ `<Suspense>` ที่ `page.tsx`)        |
| `useRouter`            | `useQueryParams`, `BackButton`                                | `router.replace` อัปเดต URL โดยไม่เพิ่ม history, `router.back()` ในปุ่มกลับ                                      |
| `usePathname`          | `useQueryParams`                                              | สร้าง URL ใหม่โดยคง path เดิม                                                                                    |
| `useSyncExternalStore` | `useLocalStorage`                                             | อ่านค่าจาก `localStorage` และตรวจจับสถานะ client mount เพื่อป้องกัน hydration mismatch ใน Next.js และ sync ทันที |

### Custom hooks

- `useLocalStorage(key, initialValue)` จัดการอ่าน/เขียนข้อมูลลง `localStorage` รองรับ SSR ของ Next.js และ sync ข้ามแท็บ/ข้ามคอมโพเนนต์ด้วย custom event
- `useFavorites()` จัดการ logic ของรายการโปรด (เก็บเฉพาะ Product ID) ให้บริการ `isFavorite(id)` และ `toggleFavorite(id)`
- `useFavoriteProducts(favorites, enabled)` ดึงข้อมูลสินค้าที่ชอบทั้งหมดตาม ID เมื่อเลือกดูรายการโปรด (`?sort=fav`) พร้อม AbortController
- `useFetch(url)` คืน `{ data, loading, error }` ใช้ในหน้า list ดึงข้อมูลสินค้าจาก DummyJSON ใช้ `AbortController` ยกเลิก request เก่าเมื่อ url เปลี่ยน เพื่อกัน race condition และเช็ก `res.ok`
- `useDebounce(value, delay)` ค่าจะอัปเดตเมื่อหยุดเปลี่ยนครบ `delay` (500ms)
- `useAutoFocus` ส่ง ref กลับมา focus ช่องค้นหาตอนโหลดหน้า
- `useQueryParams` อ่าน/เขียน URL ที่เดียว
- `useProductSearch` รวม logic ทั้งหน้า list (รวมถึงการรองรับโหมดรายการโปรด `sort=fav`)

## ทำไมใช้ `useCallback`

ฟังก์ชันที่สร้างใน component จะได้อ้างอิงใหม่ทุกครั้งที่ render ถ้าส่งลง child ที่ห่อ `React.memo` (`SearchBar`, `SortSelect`, `Pagination`) child จะเห็นว่า prop เปลี่ยนและ render ใหม่ทุกครั้ง
`useCallback` ทำให้อ้างอิงคงเดิมจนกว่า dependency จะเปลี่ยน ทำให้ `memo` ข้ามการ render ได้
(ทดสอบแล้ว: พิมพ์ในช่องค้นหา `SortSelect` ไม่ render ซ้ำ)

## Pagination

แบ่งหน้าด้วย `?page=N` ใช้ `limit` และ `skip` ของ DummyJSON (`skip = (page - 1) * 28`)

### พฤติกรรม

- **28 ชิ้นต่อหน้า** (`PAGE_SIZE` ใน `lib/products.ts`) ตรงกับ grid 4 คอลัมน์ × 7 แถว จึงไม่มีแถวสุดท้ายที่ไม่เต็มบนจอใหญ่ (ที่จอเล็กใช้ 1 หรือ 2 คอลัมน์ ซึ่ง 28 หารลงตัวเช่นกัน)
- จำนวนหน้าคำนวณจาก `total` ที่ API ส่งกลับ ทำให้ใช้ได้ทั้งตอนแสดงทั้งหมดและตอนค้นหา
- ตัวควบคุมหน้าจะซ่อนเมื่อมีหน้าเดียว
- เปลี่ยนหน้าแล้วเลื่อนขึ้นบนอัตโนมัติ (`router.replace` ตั้ง `scroll: false` ไว้ จึงเลื่อนเอง)
- แสดงเลขหน้า: หน้าแรก, หน้าสุดท้าย และเลขกลาง 3 ตัวรอบหน้าปัจจุบัน (เช่น `1 … 3 4 5 … 7`) ฟังก์ชัน `getPageItems` ใน `lib/products.ts`

### เก็บไว้ใน URL

- `page` อ่านจาก URL อย่างเดียว (เหมือน `sort`) ไม่มี state แยก หน้า 1 จะไม่ใส่ `page` ใน URL
- ค่า `page` ที่ไม่ถูกต้อง (ไม่ใช่จำนวนเต็ม หรือน้อยกว่า 1) ถือเป็นหน้า 1 ถ้าเกินจำนวนหน้า จะแสดง "ไม่พบสินค้า" พร้อมตัวควบคุมหน้า เพื่อให้กดกลับได้
- **เมื่อคำค้นหาเปลี่ยนจะรีเซ็ตกลับหน้า 1** โดยเขียน `q` และล้าง `page` ใน `router.replace` ครั้งเดียว (`setParams` ใน `useQueryParams`) และ effect จะเทียบ `q` ใน URL กับ `debouncedQuery` ก่อน ไม่งั้นการเปลี่ยนหน้าจะถูกล้างกลับเป็นหน้า 1 ทุกครั้ง
- การเปลี่ยน sort **ไม่** รีเซ็ตหน้า
- กดการ์ดไปหน้า detail แล้วกด "กลับ" จะกลับมาหน้าเดิมพร้อม q/sort ครบ เพราะใช้ `router.replace` URL ของหน้า list จึงเป็นค่าล่าสุดเสมอ

### การแยก logic ออกจาก UI

| ไฟล์                           | หน้าที่                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `hooks/useProductSearch.ts`    | อ่าน `page` จาก URL, สร้าง URL ของ API, คำนวณจำนวนหน้า, `handlePageChange`                   |
| `hooks/useQueryParams.ts`      | `setParams` อัปเดตหลาย query param ใน URL พร้อมกัน                                           |
| `hooks/usePagination.ts`       | รายการเลขหน้า, เงื่อนไขปิดปุ่มก่อนหน้า/ถัดไป, ฟังก์ชันเปลี่ยนหน้า                            |
| `hooks/usePaginationMotion.ts` | ค่าแอนิเมชัน และเคารพการตั้งค่าลดการเคลื่อนไหวของระบบ (`prefers-reduced-motion`)             |
| `lib/products.ts`              | `buildProductsUrl`, `parsePage`, `getTotalPages`, `getPageItems` (ฟังก์ชันล้วน ไม่ใช้ React) |
| `components/Pagination.tsx`    | JSX ล้วน                                                                                     |

### UI และลูกเล่น

- ใช้โครงสร้างจาก shadcn/ui (`Pagination`, `PaginationContent`, `PaginationItem`, `PaginationEllipsis`) ได้ `<nav><ul><li>` ที่ถูก semantic
- ปุ่มเป็น `<button>` จริง (ไม่ใช่ `<a>` ที่ไม่มี `href` ของ `PaginationLink`) กด Tab โฟกัสได้ และมี `aria-current="page"`
- สไตล์ pill สีดำให้เข้ากับปุ่ม "กลับ" แคปซูลสีดำของหน้าปัจจุบันเลื่อนไปหาเลขที่เลือก (`layoutId` ของ framer-motion) และปุ่มทุกปุ่มมี hover/tap แบบสปริง
- จอเล็กปุ่มก่อนหน้า/ถัดไปเหลือแค่ไอคอน จอใหญ่มีข้อความ
- ห่อ `Pagination` ด้วย `memo` และ `handlePageChange` ใช้ `useCallback` เพื่อไม่ให้ re-render เมื่อ props ไม่เปลี่ยน

### shadcn/ui

ติดตั้งด้วย `npx shadcn@latest init` และ `npx shadcn@latest add button pagination` ไฟล์ที่ CLI สร้างอยู่ที่ `src/components/ui/` ซึ่งเป็นโฟลเดอร์ที่ `components.json` ตั้งไว้ คอมโพเนนต์ใน `ui/` อ้างอิงกันเองผ่าน alias `@/components/ui` และครั้งต่อไปที่ใช้ `shadcn add` จะเขียนลงที่เดียวกัน การแยกไว้ทำให้โค้ดที่เจนมาไม่ปนกับคอมโพเนนต์ที่เขียนเอง

## Favorite (รายการโปรด)

บันทึกสินค้าที่ชอบลงใน `localStorage` ผ่าน custom hook `useLocalStorage` และสามารถดูรายการโปรดทั้งหมดผ่านตัวเลือกเรียงลำดับ `?sort=fav`

### พฤติกรรม

- **ปุ่มหัวใจ ❤️ บนการ์ดสินค้าและหน้ารายละเอียด**: กดเพื่อเพิ่มหรือนำออกจากรายการโปรดได้ทันที
- **เก็บข้อมูลเฉพาะ ID**: จัดเก็บเป็น Array ของ Product ID (เช่น `[1, 12, 18]`) ภายใต้ key `favorites` ใน `localStorage`
- **กรองดูเฉพาะรายการโปรด**: เพิ่มตัวเลือก "❤️ รายการโปรด" ใน Dropdown เรียงลำดับ (`?sort=fav`) โดยจะดึงสินค้าที่กดชอบไว้ทั้งหมดมาแสดงผล ไม่ว่าจะอยู่หน้าไหนของ API ปกติ
- **ค้นหาในรายการโปรดได้**: ขณะอยู่ในโหมด `sort=fav` สามารถพิมพ์ค้นหาผ่านช่อง SearchBar เพื่อกรองเฉพาะสินค้าที่ชื่นชอบได้
- **แบ่งหน้า (Pagination)**: รองรับการแบ่งหน้าตามปกติ (28 ชิ้นต่อหน้า) หากมีรายการสินค้าที่ชื่นชอบจำนวนมาก
- **In-Memory Cache & Rate-limit Safe**: มีระบบแคชสินค้าในหน่วยความจำ (`productCache`) ป้องกันการยิง API ซ้ำซ้อน และป้องกันปัญหา HTTP 429 Too Many Requests
- **ป้องกัน Hydration Mismatch**: ใช้ `useSyncExternalStore` เพื่อตรวจจับสถานะ client mount ทำให้ Next.js SSR ไม่เกิด hydration mismatch

### การแยก logic ออกจาก UI

| ไฟล์                            | หน้าที่                                                                                                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `hooks/useLocalStorage.ts`      | Generic hook จัดการอ่าน/เขียน `localStorage` รองรับ Next.js SSR ด้วย `useSyncExternalStore` (Hydration-safe), ซิงก์ข้ามแท็บด้วย `storage` และซิงก์ในหน้าเดียวกันด้วย `local-storage` event |
| `hooks/useFavorites.ts`         | จัดการ logic รายการโปรด เช่น ตรวจสอบสถานะ `isFavorite(id)`, สลับสถานะ `toggleFavorite(id)` และให้ array `favorites`                                                                        |
| `hooks/useFavoriteProducts.ts`  | จัดการดึงข้อมูลสินค้าตาม ID เฉพาะเมื่ออยู่ในโหมด `sort=fav` พร้อมระบบ in-memory cache และ `AbortController`                                                                                |
| `hooks/useProductSearch.ts`     | ผสานโหมด `sort=fav` เข้ากับระบบค้นหา, คำนวณจำนวนหน้า และการสลับหน้า                                                                                                                        |
| `components/FavoriteButton.tsx` | ปุ่ม UI หัวใจล้วน มีแอนิเมชัน spring, รองรับทั้งขนาดเล็กบนการ์ดและขนาดใหญ่พร้อมข้อความในหน้า detail                                                                                        |

### UI และลูกเล่น

- ใช้ไอคอน `Heart` จาก `lucide-react` และแอนิเมชัน spring ด้วย `framer-motion` (มี hover/tap feedback)
- บนการ์ดสินค้า (`ProductCard`): ปุ่มถูกวางซ้อนที่มุมบนขวาของรูปภาพ พร้อมดัก `e.preventDefault()` และ `e.stopPropagation()` ป้องกันการกดหัวใจแล้วนำทางไปหน้า detail
- ปรับโครงสร้าง `ProductCard` ให้ถูกต้องตามมาตรฐาน semantic HTML โดยไม่นำ `<button>` ไปซ้อนไว้ใต้ `<a>` (หมดปัญหา React validateDOMNesting warning)
- หน้ารายละเอียดสินค้า (`ProductDetail`): มีปุ่มพร้อมป้ายสถานะ ("เพิ่มในรายการโปรด" / "ถูกใจแล้ว") ข้างหมวดหมู่สินค้า
- รองรับ Accessibility อย่างครบถ้วนด้วย `aria-label`, `aria-pressed` และ `focus-visible`

## หน้ารายละเอียดเป็น Server Component

เปลี่ยนหน้ารายละเอียดสินค้า (`src/app/products/[id]/page.tsx` และ `src/components/ProductDetail.tsx`) ให้เป็น Server Component เพื่อดึงข้อมูลสินค้าตรงจาก Server

### การทำงาน

- `page.tsx` เป็น `async function` ดึง `id` จาก `params` (ใช้ `await params` ตามมาตรฐาน Next.js 15+)
- ยิง `fetch` ตรงจาก Server ไปยัง DummyJSON API
- หากไม่พบสินค้า จะเรียก `notFound()` เพื่อแสดงหน้า 404 ของระบบ
- ส่งข้อมูล `product` ให้ `ProductDetail` แสดงผลเป็น HTML ทันที โดยคอมโพเนนต์นี้ไม่มี `"use client"` และไม่ต้องมี state `loading`/`error` อีกต่อไป
- จุดที่มี User Interaction อย่าง `BackButton` (animation และประวัติการย้อนกลับ) และ `FavoriteButton` (localStorage และการคลิก) ยังคงเป็น Client Component (`"use client"`) แทรกอยู่ภายใน Server Component ได้อย่างถูกต้อง

### เปรียบเทียบ: Server Component ต่างจากแบบเดิม (Client Component) อย่างไร?

| มิติ                       | แบบเดิม (Client Component)                                                                            | แบบใหม่ (Server Component)                                                                                     |
| :------------------------- | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **จุดที่เกิดการ Fetch**    | ยิง API จาก **เบราว์เซอร์ของผู้ใช้** หลัง JavaScript โหลดเสร็จและเมานต์ (`useEffect`)                 | ยิง API บน **Server ของ Next.js** ตั้งแต่ตอนสร้างหน้าเว็บด้วย `async/await`                                    |
| **ประสบการณ์ผู้ใช้ (UX)**  | ผู้ใช้จะเห็นหน้าเปล่าหรือข้อความ `"กำลังโหลด..."` ก่อนสักครู่ก่อนที่สินค้าจะปรากฏ                     | ผู้ใช้ได้รับหน้าเว็บที่มีรูปภาพและเนื้อหาสินค้าครบถ้วนทันที (Instant First Contentful Paint)                   |
| **SEO และ Social Sharing** | Web Crawlers/บอทค้นหาอาจมองไม่เห็นเนื้อหาเพราะต้องรอรัน JavaScript ฝั่ง Client                        | **ดีขึ้นชัดเจน** ข้อมูลสินค้าอยู่ใน Initial HTML ตั้งแต่แรก บอทเก็บข้อมูลได้ทันที และทำ Dynamic Metadata ได้   |
| **ขนาด JS Bundle**         | ขนาดใหญ่กว่า เพราะต้องส่งโค้ด `useFetch`, `useState`, `useEffect` และ Logic อื่นๆ ไปให้เบราว์เซอร์รัน | **เบาลง** ไม่ต้องส่งโค้ด Fetch/Data Logic ไปฝั่ง Client ทำให้เบราว์เซอร์ไม่ต้องโหลดโค้ดส่วนนี้                 |
| **โครงสร้างคอมโพเนนต์**    | รวม State, Effect, Navigation และ UI ไว้ในคอมโพเนนต์เดียวกันผ่าน custom hook                          | แยกชัดเจน: หน้าและโครงสร้างหลักเป็น Server Component ส่วนจุดที่มี interactivity แยกเป็น Client Component ย่อยๆ |

## การตัดสินใจออกแบบ

- `sort` อ่านจาก URL อย่างเดียว ไม่มี state แยก เพื่อไม่ให้ข้อมูลสองที่ไม่ตรงกัน ค่าที่ไม่ถูกต้อง (เช่น `?sort=abc`) ถือเหมือนไม่มี sort
- `sort=fav` แสดงเฉพาะสินค้าที่กด Favorite ไว้ทั้งหมด (ดึงข้อมูลตาม ID ที่บันทึกไว้ใน localStorage) โดยการสลับเข้าหรือออกจากโหมด `fav` จะรีเซ็ตกลับหน้า 1 อัตโนมัติ
- `q` มี state สำหรับช่องพิมพ์ (ให้ตอบสนองทันที) แล้วเขียนลง URL หลัง debounce 500ms
- ใช้ `router.replace` ไม่ใช่ `push` เพื่อไม่ให้พิมพ์ทีละคำสร้าง history
- `"use client"` ใส่เฉพาะไฟล์ที่เป็นขอบเขตฝั่ง Client จริงๆ (`ProductsContent`, `FavoriteButton`, `BackButton`, `SearchBar`, `SortSelect`) ส่วนหน้าและเนื้อหา detail เป็น Server Component
- หน้ารายละเอียดสินค้าดึงข้อมูลบน Server โดยตรง หากสินค้าไม่มีอยู่จริงจะตัดเข้าสู่ `notFound()` ทันที

## ข้อจำกัดที่ทราบ

- ปุ่ม "กลับ" ใช้ `router.back()` ถ้ามี history ถ้าเปิดหน้า detail ตรงๆ จะไปที่ `/products` แต่ถ้าเปิดลิงก์มาจากเว็บอื่นในแท็บเดิม จะกลับไปเว็บนั้น (ตรวจจาก `history.length` เป็นการประมาณ)
- ระหว่างค้นหาใหม่ จะเห็นรายการเก่าพร้อมข้อความโหลดจนกว่าผลใหม่จะมา
- **sort เรียงเฉพาะสินค้าในหน้าที่เห็น** เพราะข้อมูลถูกแบ่งหน้าจาก API และโจทย์ให้เรียงฝั่ง client (ไม่ยิง API ใหม่) ผู้ใช้อาจเห็นสินค้าราคาต่ำกว่าอยู่หน้าถัดไป ถ้าต้องการเรียงทั้งหมดต้องใช้ `sortBy`/`order` ของ API ซึ่งจะยิง request ใหม่ทุกครั้งที่เปลี่ยน sort
- ถ้าพิมพ์ค้นหาแล้วกดเปลี่ยนหน้าก่อนครบ 500ms หน้าจะถูกรีเซ็ตเป็น 1 เมื่อคำค้นถูกบันทึกลง URL

## Bonus

- ✅ Pagination ผ่าน `?page=N`
- ✅ ปุ่ม favorite + `useLocalStorage`
- ✅ หน้า detail เป็น Server Component

## เกณฑ์ตรวจงาน (Checklist)

- [x] **พิมพ์เร็วๆ แล้ว API ไม่ถูกยิงทุกตัวอักษร:** มี `useDebounce(500ms)` หน่วงเวลาก่อนบันทึกลง URL และยิง API ค้นหา
- [x] **Refresh หน้าแล้วค่า search กับ sort ยังอยู่:** อ่านค่าเริ่มต้นจาก `useSearchParams` ทั้ง `q`, `sort` และ `page`
- [x] **เปลี่ยน sort แล้วไม่มี request ใหม่:** จัดเรียงราคาฝั่ง client ด้วย `sortByPrice` ใน `useMemo` โดยไม่มี request ไปยัง DummyJSON API
- [x] **กดกลับจากหน้ารายละเอียดแล้ว state เดิมยังอยู่:** ปุ่ม `BackButton` เรียก `router.back()` และ `useProductSearch` ซิงก์ค่าจาก URL กลับเข้า state อัตโนมัติ
- [x] **มี loading และ error state ทั้งสองหน้า:**
  - หน้ารายการสินค้า: มี `{loading}` และ `{error}` พร้อม `<Suspense>` fallback
  - หน้ารายละเอียดสินค้า: มี `loading.tsx` และ `not-found.tsx` รองรับการทำงานของ Server Component
- [x] **ไม่มี warning ใน console:** จัดการ unique key ครบถ้วน, ปรับโครงสร้างการ์ดสินค้าไม่ให้ `<button>` ซ้อนใน `<a>` และไม่มี warning เรื่อง dependency array
- [x] **ใส่ `"use client"` เฉพาะไฟล์ที่จำเป็น:** หน้า `page.tsx` ทั้งหมดและ `ProductDetail` เป็น Server Component ส่วนไฟล์ที่มี Event/Hooks (`SearchBar`, `SortSelect`, `FavoriteButton`, `BackButton`, `ProductsContent`) จึงใส่ `"use client"`
