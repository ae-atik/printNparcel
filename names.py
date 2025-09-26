import os

def list_files(base_dir, ignore_folders=None, output_file="file_list.txt"):
    """
    Recursively lists all files in base_dir and saves their full paths.
    
    Args:
        base_dir (str): The root directory to start scanning.
        ignore_folders (list): List of folder names to ignore.
        output_file (str): File to save the list of files.
    """
    if ignore_folders is None:
        ignore_folders = [".bolt", "node_modules"]

    with open(output_file, "w", encoding="utf-8") as f:
        for root, dirs, files in os.walk(base_dir):
            # Modify dirs in-place to skip ignored folders
            dirs[:] = [d for d in dirs if d not in ignore_folders]

            for file in files:
                full_path = os.path.join(root, file)
                f.write(full_path + "\n")

    print(f"File list saved to {output_file}")


if __name__ == "__main__":
    # Change this to the directory you want to scan
    base_directory = "."

    # Add folders you want to ignore here
    ignore_list = ["venv", "__pycache__", ".git"]

    list_files(base_directory, ignore_folders=ignore_list)
