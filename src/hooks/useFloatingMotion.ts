import { useReducedMotion, type MotionProps } from "framer-motion";

export interface FloatOptions {
  /** หน่วงก่อนปรากฏ (วินาที) */
  delay: number;
  /** เวลาลอยหนึ่งรอบ (วินาที) */
  duration: number;
  /** ระยะลอยขึ้น (px) */
  drift: number;
}

type FloatProps = Pick<MotionProps, "initial" | "animate" | "transition">;

/**
 * สร้าง props ของ framer-motion สำหรับองค์ประกอบที่ปรากฏแล้วลอยเบาๆ
 * ถ้าผู้ใช้ตั้งค่าลดการเคลื่อนไหวในระบบ จะแสดงผลนิ่งโดยไม่ลอย
 */
export function useFloatingMotion() {
  const reduceMotion = useReducedMotion();

  const getFloatProps = ({
    delay,
    duration,
    drift,
  }: FloatOptions): FloatProps => ({
    initial: { opacity: 0, scale: 0.8 },
    animate: reduceMotion
      ? { opacity: 1, scale: 1 }
      : { opacity: 1, scale: 1, y: [0, -drift, 0] },
    transition: {
      opacity: { duration: 0.5, delay },
      scale: { duration: 0.5, delay },
      y: {
        duration,
        delay: delay + 0.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  });

  return { getFloatProps };
}
