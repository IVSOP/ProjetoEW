#!/usr/bin/bash

DB="proj_ruas"
IMPORT_DIR="import"
IMPORT_FILENAME="export.tar.xz"

mkdir -p "$IMPORT_DIR"

# extract outer files
tar -C "$IMPORT_DIR" -x -f "$IMPORT_FILENAME"

# read manifest
SIZE=$(jq '.size' "$IMPORT_DIR/manifest.json")

(cd "$IMPORT_DIR" && xz --decompress --threads=0 "files.tar.xz" --stdout | pv -s $SIZE | tar -x -f -)

mongoimport --jsonArray -d $DB -c "streets"  "$IMPORT_DIR/streets.json"
mongoimport --jsonArray -d $DB -c "dates"    "$IMPORT_DIR/dates.json"
mongoimport --jsonArray -d $DB -c "entities" "$IMPORT_DIR/entities.json"
mongoimport --jsonArray -d $DB -c "places"   "$IMPORT_DIR/places.json"
mongoimport --jsonArray -d $DB -c "antigo"   "$IMPORT_DIR/antigo.json"
mongoimport --jsonArray -d $DB -c "atual"    "$IMPORT_DIR/atual.json"

rm "$IMPORT_DIR/files.tar.xz"
rm "$IMPORT_DIR/manifest.json"
rm "$IMPORT_FILENAME"