from pathlib import Path
import hashlib, zipfile
root = Path(__file__).resolve().parents[1]
out = root / "dist" / "adaptive-carousel-enhancer-0.1.1.zip"
out.parent.mkdir(exist_ok=True)
files = [p for p in root.rglob("*") if p.is_file() and not any(x in p.relative_to(root).parts for x in (".git", "node_modules", "dist", "tests", "bin")) and not p.name.startswith(".") and not p.name.endswith(".map")]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as archive:
    for p in sorted(files):
        info = zipfile.ZipInfo("adaptive-carousel-enhancer/" + p.relative_to(root).as_posix(), (2026,10,30,0,0,0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, p.read_bytes())
print(out)
print(hashlib.sha256(out.read_bytes()).hexdigest())
