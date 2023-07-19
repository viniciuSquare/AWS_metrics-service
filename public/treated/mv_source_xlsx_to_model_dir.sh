#!/bin/bash

# Define source and destination directories
src_dir="/Users/square/Documents/Quiver/Projects/AWS_PerformanceReport/public/treated"
dest_dir="/Users/square/Documents/Quiver/Projects/AWS_PerformanceReport/public/treated/Model"

# Extract the Model - Final.zip file and rename the extracted folder to Model
unzip -q "$src_dir/Model.zip" -d "$src_dir"

# Loop through the source directory and copy files to their respective model directories
for file in $src_dir/*.xlsx; do
  if [[ $file == *"Application"* ]]; then
    if [[ $file == *"PRO"* ]]; then
      mv "$file" "$dest_dir/PRO Application"
    elif [[ $file == *"PLUS"* ]]; then
      mv "$file" "$dest_dir/PLUS Application"
    fi
  elif [[ $file == *"Database"* ]]; then
    if [[ $file == *"PRO"* ]]; then
      mv "$file" "$dest_dir/PRO Database"
    elif [[ $file == *"PLUS"* ]]; then
      mv "$file" "$dest_dir/PLUS Database"
    fi
  fi
done