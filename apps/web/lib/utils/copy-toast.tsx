import { toast } from "sonner";

/**
 * 텍스트를 클립보드에 복사하고 화면 중앙에 토스트 표시
 */
export async function copyToClipboard(
  text: string,
  message: string = "클립보드에 복사되었습니다"
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(message, {
      position: "top-center",
      duration: 2000,
    });
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    toast.error("복사에 실패했습니다", {
      position: "top-center",
    });
    return false;
  }
}
