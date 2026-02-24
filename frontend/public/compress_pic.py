from pathlib import Path
from PIL import Image

SRC_DIR = Path(__file__).resolve().parent / "pictures"
DST_DIR = Path(__file__).resolve().parent / "covers"

# WebP 压缩参数（可按需调整）
QUALITY = 80   # 0-100，越高质量越好、体积越大
METHOD = 6     # 0-6，越高压缩更慢但更小

def convert_to_webp(src_root: Path, dst_root: Path) -> None:
    if not src_root.exists():
        print(f"[ERROR] 源目录不存在: {src_root}")
        return

    exts = {".jpg", ".jpeg", ".png"}
    files = [p for p in src_root.rglob("*") if p.is_file() and p.suffix.lower() in exts]

    if not files:
        print(f"[INFO] 未找到 jpg/jpeg/png 图片: {src_root}")
        return

    count_ok = 0
    count_fail = 0

    for src in files:
        rel = src.relative_to(src_root)
        out_dir = dst_root / rel.parent
        out_dir.mkdir(parents=True, exist_ok=True)

        out_file = out_dir / f"{src.stem}.webp"

        try:
            with Image.open(src) as im:
                # 统一转 RGB / RGBA，避免部分模式保存失败
                if im.mode not in ("RGB", "RGBA"):
                    im = im.convert("RGBA" if "A" in im.getbands() else "RGB")

                im.save(
                    out_file,
                    format="WEBP",
                    quality=QUALITY,
                    method=METHOD,
                    optimize=True
                )
            count_ok += 1
            print(f"[OK] {src} -> {out_file}")
        except Exception as e:
            count_fail += 1
            print(f"[FAIL] {src}: {e}")

    print(f"\n完成：成功 {count_ok}，失败 {count_fail}。输出目录：{dst_root}")

if __name__ == "__main__":
    convert_to_webp(SRC_DIR, DST_DIR)