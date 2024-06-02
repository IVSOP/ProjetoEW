#!/usr/bin/bash

# if [[ -z $1 ]]
# then
# 	echo "args are <db>"
# 	exit 1
# fi

DB="proj_ruas"
IMPORT_DIR="import"

mkdir -p "$IMPORT_DIR"
mkdir -p "$IMPORT_DIR/atual"
mkdir -p "$IMPORT_DIR/antigo"


--strip-components 1
xz --decompress --threads=0


mongoexport --jsonArray -d $DB -c "streets"  -o "$IMPORT_DIR/streets.json"
mongoexport --jsonArray -d $DB -c "dates"    -o "$IMPORT_DIR/dates.json"
mongoexport --jsonArray -d $DB -c "entities" -o "$IMPORT_DIR/entities.json"
mongoexport --jsonArray -d $DB -c "places"   -o "$IMPORT_DIR/places.json"
mongoexport --jsonArray -d $DB -c "antigo"   -o "$IMPORT_DIR/antigo.json"
mongoexport --jsonArray -d $DB -c "atual"    -o "$IMPORT_DIR/atual.json"

# para as imagens, temos de exportar tambem as imagens em si
# mas so vamos considerar aquelas que existirem na colecao das imagens
# assume que imagens estao em parsed/antigo e parsed/atual

for i in $(jq '.[]."_id"."$oid"' "$IMPORT_DIR/antigo.json" | tr -d '"')
do
	IMAGE="parsed/antigo/$i.*" # fica mais facil do que tar a ir a outro json ir buscar a extension
	cp $IMAGE "$IMPORT_DIR/antigo/"
done

for i in $(jq '.[]."_id"."$oid"' "$IMPORT_DIR/atual.json" | tr -d '"')
do
	IMAGE="parsed/atual/$i.*" # fica mais facil do que tar a ir a outro json ir buscar a extension
	cp $IMAGE "$IMPORT_DIR/atual/"
done


# all files are now ready to tar. to make it prettier, going to use pv to monitor the time taken
# need size of files in order to do that
# will be kept in metadata file

touch "$IMPORT_DIR/manifest.json"



SIZE=$(du --bytes --total "$IMPORT_DIR/" | tail -n 1 | cut -f 1)


# a lista de ficheiros de imagens nao fica no manifesto pois ja esta no json das imagens antigas e atuais

echo "{\"size\": $SIZE}" | jq > "$IMPORT_DIR/manifest.json"

# por fim, fazemos o tar.xz ja com acesso ao pv e xz
tar -c -f - --owner=0 --group=0 --no-same-owner --no-same-permissions "$IMPORT_DIR/" | pv -s $SIZE | xz --threads=0 --stdout > "export.tar.xz"
