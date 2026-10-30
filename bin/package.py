from pathlib import Path
import hashlib, zipfile, os
root = Path(__file__).resolve().parents[1]
out = root / "dist" / "adaptive-carousel-enhancer-0.1.1.zip"
out.parent.mkdir(exist_ok=True)
files = []
for directory, subdirs, names in os.walk(root):
    subdirs[:] = [name for name in subdirs if name not in ('.git', 'node_modules', 'dist', 'tests', 'bin')]
    files.extend(Path(directory) / name for name in names if not name.startswith('.') and not name.endswith('.map'))
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as archive:
    for p in sorted(files):
        info = zipfile.ZipInfo("adaptive-carousel-enhancer/" + p.relative_to(root).as_posix(), (2026,10,30,0,0,0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, p.read_bytes())
print(out)
print(hashlib.sha256(out.read_bytes()).hexdigest())
