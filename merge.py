import argparse
import os
import sys
from pathlib import Path
from fnmatch import fnmatch

DEFAULT_IGNORED_DIRS = {
    "node_modules", ".git", "build", "dist", ".next", ".cache",
    "coverage", ".turbo", ".yarn", ".pnpm", ".husky"
}

DEFAULT_IGNORED_GLOBS = [
    "*.png", "*.jpg", "*.jpeg", "*.gif", "*.webp", "*.ico", "*.svg",
    "*.mp4", "*.mp3", "*.wav", "*.mov",
    "*.zip", "*.gz", "*.br", "*.tar", "*.rar", "*.7z",
    "*.woff", "*.woff2", "*.ttf", "*.eot", "*.otf",
    "*.pdf", "*.dll",
    "*.DS_Store", "*.lock",  "merge.py", "package-lock.json"
]

BINARY_EXTS = {
    ".png",".jpg",".jpeg",".gif",".webp",".ico",".svg",
    ".mp4",".mp3",".wav",".mov",
    ".zip",".gz",".br",".tar",".rar",".7z",
    ".woff",".woff2",".ttf",".eot",".otf",
    ".pdf",".dll"
}

def path_is_within(child: Path, parent: Path) -> bool:
    try:
        return child.is_relative_to(parent)  # py39+
    except AttributeError:
        child = child.resolve()
        parent = parent.resolve()
        return parent in child.parents or child == parent

def should_ignore_dir(path: Path, ignored_dirs: set, ignored_globs: list) -> bool:
    # If any segment equals an ignored dir name
    for part in path.parts:
        if part in ignored_dirs:
            return True
    # Or the full posix path matches any ignore glob
    rel = path.as_posix()
    return any(fnmatch(rel, pat) for pat in ignored_globs)

def should_ignore_file(path: Path, ignored_globs: list) -> bool:
    name = path.name
    if any(fnmatch(name, pat) for pat in ignored_globs):
        return True
    if path.suffix.lower() in BINARY_EXTS:
        return True
    return False

def concat_project(root: Path, out_file: Path, ignored_dirs, ignored_globs, max_mb: float, include_hidden: bool, skip_symlinks: bool = True):
    root = root.resolve()
    out_file = out_file.resolve()

    if not root.exists() or not root.is_dir():
        print(f"Root folder does not exist or is not a directory: {root}", file=sys.stderr)
        sys.exit(1)

    # If writing inside root, make sure we never read our own output
    if path_is_within(out_file, root):
        ignored_globs = list(ignored_globs) + [out_file.name]

    byte_file_limit = int(max_mb * 1024 * 1024)

    files_written = 0

    with out_file.open("w", encoding="utf-8", newline="\n") as out:
        for current_dir, dirnames, filenames in os.walk(root, followlinks=False):
            cur = Path(current_dir)

            # Deterministic traversal
            dirnames[:] = sorted(dirnames)
            filenames = sorted(filenames)

            # Prune ignored directories for os.walk
            pruned = []
            for d in list(dirnames):
                dpath = cur / d
                if d.startswith(".") and not include_hidden:
                    pruned.append(d)
                    continue
                if should_ignore_dir(dpath, ignored_dirs, ignored_globs):
                    pruned.append(d)
            for d in pruned:
                dirnames.remove(d)

            for fname in filenames:
                fpath = cur / fname
                rel = None

                # Quick filters
                if skip_symlinks and fpath.is_symlink():
                    continue
                if not include_hidden and fname.startswith("."):
                    continue
                if should_ignore_file(fpath, ignored_globs):
                    continue

                # Skip the output file itself if it is inside root
                try:
                    if fpath.resolve() == out_file:
                        continue
                except Exception:
                    pass

                try:
                    # Size check per file
                    try:
                        size = fpath.stat().st_size
                        if byte_file_limit > 0 and size > byte_file_limit:
                            continue
                    except FileNotFoundError:
                        continue  # transient

                    rel = fpath.relative_to(root).as_posix()
                    out.write(f"FILE: {rel}\n")

                    # Read and normalize line endings
                    with fpath.open("r", encoding="utf-8", errors="replace", newline="") as fin:
                        for line in fin:
                            if line.endswith("\r\n"):
                                line = line[:-2] + "\n"
                            elif line.endswith("\r"):
                                line = line[:-1] + "\n"
                            out.write(line)

                    out.write("\n")
                    files_written += 1

                except Exception as e:
                    # Ensure we always print a header that identifies the file
                    if rel is None:
                        try:
                            rel = fpath.relative_to(root).as_posix()
                        except Exception:
                            rel = fpath.as_posix()
                    out.write(f"FILE: {rel}\n")
                    out.write(f"[Skipped due to read error: {e}]\n\n")
                    continue

    print(f"Done. Wrote {files_written} files into {out_file}")

def parse_args():
    p = argparse.ArgumentParser(
        description="Concatenate project source files into one txt with per-file headers."
    )
    p.add_argument("root", help="Path to the project root")
    p.add_argument("output", help="Path to output txt file")
    p.add_argument("--ignore-dirs", nargs="*", default=[],
                   help="Extra directory names or globs to ignore")
    p.add_argument("--ignore-globs", nargs="*", default=[],
                   help="Extra file globs to ignore like *.log")
    p.add_argument("--max-mb", type=float, default=2.0,
                   help="Skip files larger than this many megabytes. Use 0 to disable. Default 2")
    p.add_argument("--include-hidden", action="store_true",
                   help="Include dotfiles and dot-directories")
    p.add_argument("--no-skip-symlinks", action="store_true",
                   help="Follow and include symlinked files")
    return p.parse_args()

def main():
    args = parse_args()
    root = Path(args.root)
    output = Path(args.output)

    ignored_dirs = set(DEFAULT_IGNORED_DIRS)
    ignored_dirs.update(args.ignore_dirs or [])

    ignored_globs = list(DEFAULT_IGNORED_GLOBS)
    ignored_globs.extend(args.ignore_globs or [])

    concat_project(
        root,
        output,
        ignored_dirs,
        ignored_globs,
        args.max_mb,
        args.include_hidden,
        skip_symlinks=not args.no_skip_symlinks,
    )

if __name__ == "__main__":
    main()