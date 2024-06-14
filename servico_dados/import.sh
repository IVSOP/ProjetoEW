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
mkdir -p $IMPORT_DIR

IMPORT_PATH="$1"
IMPORT_FILENAME="$(basename $IMPORT_PATH)"
mv "$IMPORT_PATH" "$IMPORT_DIR/$IMPORT_FILENAME"
IMPORT_PATH="$IMPORT_DIR/$IMPORT_FILENAME"
echo "Importing from file $IMPORT_PATH"

# reset da BD, apagar imagens
rm -rf imagens/*

# extract outer files
(cd "$IMPORT_DIR" && tar -x -f "$IMPORT_FILENAME")

# read metadata
SIZE=$(jq '.meta.size' "$IMPORT_DIR/manifest.json")

# decompress ficheiros para dir de import
echo "Decompressing"
(cd "$IMPORT_DIR" && xz --decompress --threads=0 "files.tar.xz" --stdout | pv --force -s $SIZE | tar -x -f -)

# ler em loop todas as colecoes mencionadas
# -c para tirar pretty print, [] por magia mete uma entrada por linha

# flags para ver se estas collections ja apareceram
ATUAL="false"
ATUAL_PATH=""
ANTIGO="false"
ANTIGO_PATH=""

echo "Checking files"
readarray -t ENTRIES < <(jq -c '.dados[]' "$IMPORT_DIR/manifest.json")
for ENTRY in "${ENTRIES[@]}"
do
	COLLECTION=$(echo $ENTRY | jq '.collection' | tr -d \")
	FILEPATH="$IMPORT_DIR/$(echo $ENTRY | jq '.filename' | tr -d \")"
	RECORDS=$(echo $ENTRY | jq '.records')

	echo "Checking $FILEPATH, collection $COLLECTION"

	# se nao tiver records, dar skip
	if [ $RECORDS -eq 0 ]
	then
		echo "No records, skipping"
		continue
	fi

	if [ "$COLLECTION" = "atual" ]
	then
		ATUAL="true"
		ATUAL_FILEPATH=$FILEPATH
	else
		if [ "$COLLECTION" = "antigo" ]
		then
			ANTIGO="true"
			ANTIGO_FILEPATH=$FILEPATH
		fi
	fi

	# check if file exists
	if [ ! -f $FILEPATH ]
	then
		echo "File $FILEPATH does not exist"
		exit 1
	fi

	# check if number of records match
	ACTUAL_RECORDS=$(jq length $FILEPATH)
	if [ $ACTUAL_RECORDS -ne $RECORDS ]
	then
		echo "Records differ: $RECORDS vs $ACTUAL_RECORDS"
		exit 1
	fi

	# import
	echo "Dropping collection"
	mongosh --host mongodb --eval "db.$COLLECTION.drop()" "$DB" 2>&1 > /dev/null
	echo "Importing"
	mongoimport --host=mongodb --jsonArray -d "$DB" -c "$COLLECTION" "$FILEPATH"
done

# se records de imagens foram passados, assumimos que as proprias imagens tambem existem
# verificar se estao todas la
if [ "$ATUAL" = "true" ]
then
	# isto e magia, entra no array e junta oid com extension
	echo "Checking atual, file is $ATUAL_FILEPATH"

	if diff <(jq '.[] | "\(.["_id"]["$oid"]).\(.["extension"])"' $ATUAL_FILEPATH | tr -d \" | sort) <(ls -1 "$IMPORT_DIR/atual/" | sort) 2>&1 > /dev/null
	then
		mv -f "$IMPORT_DIR/atual/" "imagens/"
	else
		echo "Error in atual: records do not match files"
		exit 1
	fi
fi

if [ "$ANTIGO" = "true" ]
then
	echo "Checking antigo, file is $ANTIGO_FILEPATH"
	if diff <(jq '.[] | "\(.["_id"]["$oid"]).\(.["extension"])"' $ANTIGO_FILEPATH | tr -d \" | sort) <(ls -1 "$IMPORT_DIR/antigo/" | sort) 2>&1 > /dev/null
	then
		mv -f "$IMPORT_DIR/antigo/" "imagens/"
	else
		echo "Error in antigo: records do not match files"
		exit 1
	fi
fi


# rm "$IMPORT_DIR/files.tar.xz"
# rm "$IMPORT_DIR/manifest.json"
rm -r "$IMPORT_DIR/"

echo "Finished importing"
