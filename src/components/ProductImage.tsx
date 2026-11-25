import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ProductImageProps {
  source: string;
  alt: string;
  className?: string;
}

export default function ProductImage({ source, alt, className = "" }: ProductImageProps) {
  // Lưu URL bị lỗi. Khi source thay đổi, ảnh mới được thử tải lại.
  const [failedSource, setFailedSource] = useState("");

  if (source === "" || failedSource === source) {
    return (
      <div className={"photo-fallback flex items-center justify-center text-[#a3b1a1] " + className} role="img" aria-label={alt}>
        <ImageOff size={36} strokeWidth={1.4} />
      </div>
    );
  }

  function handleError() {
    setFailedSource(source);
  }

  return <img src={source} alt={alt} loading="lazy" className={"object-cover " + className} onError={handleError} />;
}
