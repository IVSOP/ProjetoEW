#!/usr/bin/bash

DB="proj_ruas"
EXPORT_DIR="export"
EXPORT_FILENAME="export.tar.xz"

mkdir -p "$EXPORT_DIR"
mkdir -p "$EXPORT_DIR/atual"
mkdir -p "$EXPORT_DIR/antigo"

mongoexport --jsonArray -d $DB -c "streets"  -o "$EXPORT_DIR/streets.json"
mongoexport --jsonArray -d $DB -c "dates"    -o "$EXPORT_DIR/dates.json"
mongoexport --jsonArray -d $DB -c "entities" -o "$EXPORT_DIR/entities.json"
mongoexport --jsonArray -d $DB -c "places"   -o "$EXPORT_DIR/places.json"
mongoexport --jsonArray -d $DB -c "antigo"   -o "$EXPORT_DIR/antigo.json"
mongoexport --jsonArray -d $DB -c "atual"    -o "$EXPORT_DIR/atual.json"

# para as imagens, temos de exportar tambem as imagens em si
# mas so vamos considerar aquelas que existirem na colecao das imagens
# assume que imagens estao em parsed/antigo e parsed/atual

for i in $(jq '.[]."_id"."$oid"' "$EXPORT_DIR/antigo.json" | tr -d '"')
do
	IMAGE="parsed/antigo/$i.*" # fica mais facil do que tar a ir a outro json ir buscar a extension
	cp $IMAGE "$EXPORT_DIR/antigo/"
done

for i in $(jq '.[]."_id"."$oid"' "$EXPORT_DIR/atual.json" | tr -d '"')
do
	IMAGE="parsed/atual/$i.*" # fica mais facil do que tar a ir a outro json ir buscar a extension
	cp $IMAGE "$EXPORT_DIR/atual/"
done


# all files are now ready to tar. to make it prettier, going to use pv to monitor the time taken
# need size of files in order to do that
# will be kept in metadata file

touch "$EXPORT_DIR/manifest.json"

# nao acabou por ser feito, nao da para checksum em dirs e o http ja faz isso e ja
# SHA256_STREETS=$(du --bytes --total "$EXPORT_DIR/streets.json" | tail -n 1 | cut -f 1)
# SHA256_DATES=$(du --bytes --total "$EXPORT_DIR/dates.json" | tail -n 1 | cut -f 1)
# SHA256_ENTITIES=$(du --bytes --total "$EXPORT_DIR/entities.json" | tail -n 1 | cut -f 1)
# SHA256_PLACES=$(du --bytes --total "$EXPORT_DIR/places.json" | tail -n 1 | cut -f 1)
# SHA256_ANTIGO=$(du --bytes --total "$EXPORT_DIR/antigo.json" | tail -n 1 | cut -f 1)
# SHA256_ATUAL=$(du --bytes --total "$EXPORT_DIR/atual.json" | tail -n 1 | cut -f 1)
# SHA256_IMAGENS_ANTIGO=$(du --bytes --total "$EXPORT_DIR/antigo/" | tail -n 1 | cut -f 1)
# SHA256_IMAGENS_ATUAL=$(du --bytes --total "$EXPORT_DIR/atual/" | tail -n 1 | cut -f 1)


SIZE=$(du --bytes --total "$EXPORT_DIR/" | tail -n 1 | cut -f 1)

# echo "{\"size\": $SIZE, \"sha256_streets\":$SHA_STREETS, \"ssha256_dates\":$SHA256_DATES, \"sha256_entities\":$SHA256_ENTITIES, \"sha256_places\":$SHA256_PLACES,\
# \"ssha256_antigo\":$SHA256_ANTIGO, \"sha256_atual\":$SHA256_ATUAL, \"sha256_imagens_antigo\":$SHA256_IMAGENS_ANTIGO, \"sha256_imagens_atual\":$SHA256_IMAGENS_ATUAL}" | jq > "$EXPORT_DIR/manifest.json"

# a lista de ficheiros de imagens nao fica no manifesto pois ja esta no json das imagens antigas e atuais

echo "{\"size\": $SIZE}" | jq > "manifest.json"

# por fim, fazemos o tar.xz ja com acesso ao pv e xz
(cd "$EXPORT_DIR/" && tar -c -f - --owner=0 --group=0 --no-same-owner --no-same-permissions * | pv -s $SIZE | xz --threads=0 --stdout > "../files.tar.xz")

# fazer um tar para poder meter o manifesto la dentro (nao o comprimimos)
tar -c -f "$EXPORT_FILENAME" --owner=0 --group=0 --no-same-owner --no-same-permissions "manifest.json" "files.tar.xz"

rm "files.tar.xz"
rm "manifest.json"
