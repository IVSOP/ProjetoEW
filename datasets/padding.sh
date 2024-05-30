#!/bin/bash

input_directory="./MapaRuas-materialBase/imagem"
output_directory="./MapaRuas-materialBase/pad"

mkdir -p "$output_directory"

for input_file in "$input_directory"/*.{png,jpg,jpeg,PNG,JPG}; do
  
    if [ -e "$input_file" ]; then
        filename=$(basename "$input_file")
        output_file="$output_directory/$filename"
        ffmpeg -y -i "$input_file" -vf "scale=iw*min(1500/iw\,1000/ih):ih*min(1500/iw\,1000/ih),pad=1500:1000:(1500-iw*min(1500/iw\,1000/ih))/2:(1000-ih*min(1500/iw\,1000/ih))/2:color=#fefaed" "$output_file"
    fi

done