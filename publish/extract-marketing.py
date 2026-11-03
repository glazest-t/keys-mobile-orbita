"""Extract the verified marketing release, retaining its internal relative paths."""
import sys, zipfile
from pathlib import Path
archive, destination=sys.argv[1:]
root=Path(destination).resolve()
with zipfile.ZipFile(archive) as package:
 for item in package.infolist():
  parts=Path(item.filename).parts
  if not parts or parts[0]!='keys-marketing-brand-kit' or '..' in parts:raise ValueError(item.filename)
  target=root.joinpath(*parts[1:])
  if not target.is_relative_to(root):raise ValueError(item.filename)
  if item.is_dir():target.mkdir(parents=True,exist_ok=True)
  else:
   target.parent.mkdir(parents=True,exist_ok=True)
   with package.open(item) as source,target.open('wb') as output:
    import shutil
    shutil.copyfileobj(source,output)
print('Extracted marketing release')
