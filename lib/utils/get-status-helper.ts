export function getStatusText(status?: string): string {
  switch (status?.toLowerCase()) {
    case "tidak layak":
      return "Tidak layak pakai";
    case "sedang":
      return "Masih layak pakai";
    case "bagus":
      return "Layak pakai";
    default:
      return "Belum ada";
  }
}
