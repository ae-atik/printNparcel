
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
    "*.DS_Store", "*.lock"
]

# Obvious binary extensions to skip quickly
BINARY_EXTS = {
    ".png",".jpg",".jpeg",".gif",".webp",".ico",".svg",
    ".mp4",".mp3",".wav",".mov",
    ".zip",".gz",".br",".tar",".rar",".7z",
    ".woff",".woff2",".ttf",".eot",".otf",
    ".pdf",".dll"
}

def should_ignore_dir(path: Path, ignored_dirs: set, ignored_globs: list) -> bool:
    # If any segment equals an ignored dir name
    for part in path.parts:
        if part in ignored_dirs:
            return True
    # Or the path matches any ignore glob
    rel = path.as_posix()
    return any(fnmatch(rel, pat) for pat in ignored_globs)

def should_ignore_file(path: Path, ignored_globs: list) -> bool:
    name = path.name
    if any(fnmatch(name, pat) for pat in ignored_globs):
        return True
    if path.suffix.lower() in BINARY_EXTS:
        return True
    return False

def concat_project(root: Path, out_file: Path, ignored_dirs, ignored_globs, max_mb: float, include_hidden: bool):
    root = root.resolve()
    out_file = out_file.resolve()

    if not root.exists() or not root.is_dir():
        print(f"Root folder does not exist or is not a directory: {root}", file=sys.stderr)
        sys.exit(1)

    # Prevent writing into a location that will be included
    if out_file.is_relative_to(root):
        # Make sure we will not read the output file back in
        ignored_globs = list(ignored_globs) + [out_file.name]

    bytes_limit = int(max_mb * 1024 * 1024)

    files_written = 0
    bytes_written = 0

    with out_file.open("w", encoding="utf-8", newline="\n") as out:
        for current_dir, dirnames, filenames in os.walk(root):
            cur = Path(current_dir)

            # Drop ignored directories in-place for os.walk
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
                    # Size check
                    try:
                        size = fpath.stat().st_size
                        if bytes_limit > 0 and size > bytes_limit:
                            continue
                    except FileNotFoundError:
                        continue  # transient

                    rel = fpath.relative_to(root).as_posix()

                    # Header line as the first line for this file
                    out.write(f"FILE: {rel}\n")

                    # Write the file contents
                    with fpath.open("r", encoding="utf-8", errors="replace", newline="") as fin:
                        for line in fin:
                            # Normalize to LF
                            if line.endswith("\r\n"):
                                line = line[:-2] + "\n"
                            elif line.endswith("\r"):
                                line = line[:-1] + "\n"
                            out.write(line)

                    # Ensure a blank line between files
                    out.write("\n")
                    files_written += 1
                except Exception as e:
                    # Record error but keep going
                    out.write(f"FILE: {rel}\n")
                    out.write(f"[Skipped due to read error: {e}]\n\n")
                    continue

    print(f"Done. Wrote {files_written} files into {out_file}")

def parse_args():
    p = argparse.ArgumentParser(
        description="Concatenate a React project files into one txt with per file headers."
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
                   help="Include hidden files and folders that start with a dot")
    return p.parse_args()

def main():
    args = parse_args()
    root = Path(args.root)
    output = Path(args.output)

    ignored_dirs = set(DEFAULT_IGNORED_DIRS)
    ignored_dirs.update(args.ignore_dirs or [])

    ignored_globs = list(DEFAULT_IGNORED_GLOBS)
    ignored_globs.extend(args.ignore_globs or [])

    concat_project(root, output, ignored_dirs, ignored_globs, args.max_mb, args.include_hidden)

if __name__ == "__main__":
    main()
