import Image from "next/image";

type EditorialImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export function EditorialImage({ src, alt, sizes, className, priority = false }: EditorialImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={90}
      className={className ?? "object-cover"}
    />
  );
}
