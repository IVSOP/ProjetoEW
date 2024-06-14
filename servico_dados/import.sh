#!/usr/bin/bash

set -o pipefail
set -e

if [[ -z $1 ]]
then
	echo "Please enter name of the tar file to backup from"
	exit 1
fi

DB="proj_ruas"
IMPORT_DIR="import"
IMPORT_FILENAME="$1"

# reset da BD, apagar imagens
rm -rf imagens/*
mongosh --eval "db.dropDatabase()" "$DB"

# extract outer files
mkdir -p "$IMPORT_DIR"
mv "$IMPORT_FILENAME" "$IMPORT_DIR"
(cd "$IMPORT_DIR" && tar -x -f "$IMPORT_FILENAME")

# read manifest
SIZE=$(jq '.size' "$IMPORT_DIR/manifest.json")

(cd "$IMPORT_DIR" && xz --decompress --threads=0 "files.tar.xz" --stdout | pv -s $SIZE | tar -x -f -)

mongoimport --host=mongodb --jsonArray -d $DB -c "streets"  "$IMPORT_DIR/streets.json"
mongoimport --host=mongodb --jsonArray -d $DB -c "dates"    "$IMPORT_DIR/dates.json"
mongoimport --host=mongodb --jsonArray -d $DB -c "entities" "$IMPORT_DIR/entities.json"
mongoimport --host=mongodb --jsonArray -d $DB -c "places"   "$IMPORT_DIR/places.json"
mongoimport --host=mongodb --jsonArray -d $DB -c "antigo"   "$IMPORT_DIR/antigo.json"
mongoimport --host=mongodb --jsonArray -d $DB -c "atual"    "$IMPORT_DIR/atual.json"

mv "$IMPORT_DIR/atual/" "imagens/"
mv "$IMPORT_DIR/antigo/" "imagens/"

# rm "$IMPORT_DIR/files.tar.xz"
# rm "$IMPORT_DIR/manifest.json"
rm -r "$IMPORT_DIR"
