export function isVideoUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    if (url.startsWith("data:video/")) return true;
    const cleanUrl = url.split("?")[0].toLowerCase();
    if (/\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/i.test(cleanUrl)) return true;
    if (cleanUrl.includes("/video/upload/")) return true;
    return false;
}

export function validateMediaFile(file: File): { valid: boolean; error?: string } {
    const isVideo = file.type.startsWith("video/");
    const maxVideoSize = 20 * 1024 * 1024; // 20MB
    const maxImageSize = 1 * 1024 * 1024;  // 1MB

    if (isVideo && file.size > maxVideoSize) {
        return {
            valid: false,
            error: `O vídeo "${file.name}" excede o tamanho máximo de 10MB.`
        };
    }

    if (!isVideo && file.size > maxImageSize) {
        return {
            valid: false,
            error: `A imagem "${file.name}" excede o tamanho máximo de 1MB.`
        };
    }

    return { valid: true };
}
