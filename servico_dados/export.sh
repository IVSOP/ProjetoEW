#!/usr/bin/bash

set -o pipefail
set -e

DB="proj_ruas"
EXPORT_DIR="export"
EXPORT_FILENAME="export.tar"

mkdir -p "$EXPORT_DIR"
mkdir -p "$EXPORT_DIR/atual"
mkdir -p "$EXPORT_DIR/antigo"

echo "Running mongoexport"
# o mongo ja nos diz a quantidade de entradas, mas para o stderr. o grep e o cut vao busca los
STREETS_RECORDS=$(mongoexport --host=mongodb --jsonArray -d $DB -c "streets" -o "$EXPORT_DIR/streets.json" 2>&1 | grep --only-matching -E 'exported [0-9]+ records' | cut -d' ' -f2)
DATES_RECORDS=$(mongoexport --host=mongodb --jsonArray -d $DB -c "dates" -o "$EXPORT_DIR/dates.json" 2>&1 | grep --only-matching -E 'exported [0-9]+ records' | cut -d' ' -f2)
ENTITIES_RECORDS=$(mongoexport --host=mongodb --jsonArray -d $DB -c "entities" -o "$EXPORT_DIR/entities.json" 2>&1 | grep --only-matching -E 'exported [0-9]+ records' | cut -d' ' -f2)
PLACES_RECORDS=$(mongoexport --host=mongodb --jsonArray -d $DB -c "places" -o "$EXPORT_DIR/places.json" 2>&1 | grep --only-matching -E 'exported [0-9]+ records' | cut -d' ' -f2)
ANTIGO_RECORDS=$(mongoexport --host=mongodb --jsonArray -d $DB -c "antigo" -o "$EXPORT_DIR/antigo.json" 2>&1 | grep --only-matching -E 'exported [0-9]+ records' | cut -d' ' -f2)
ATUAL_RECORDS=$(mongoexport --host=mongodb --jsonArray -d $DB -c "atual" -o "$EXPORT_DIR/atual.json" 2>&1 | grep --only-matching -E 'exported [0-9]+ records' | cut -d' ' -f2)
COMMENTS_RECORDS=$(mongoexport --host=mongodb --jsonArray -d $DB -c "comments" -o "$EXPORT_DIR/comments.json" 2>&1 | grep --only-matching -E 'exported [0-9]+ records' | cut -d' ' -f2)
USERS_RECORDS=$(mongoexport --host=mongodb --jsonArray -d $DB -c "users" -o "$EXPORT_DIR/users.json" 2>&1 | grep --only-matching -E 'exported [0-9]+ records' | cut -d' ' -f2)

# para as imagens, temos de exportar tambem as imagens em si
# mas so vamos considerar aquelas que existirem na colecao das imagens
# assume que imagens estao em imagens/antigo e imagens/atual

echo "Copying images"
# COUNT_ANTIGO=0
for i in $(jq '.[]."_id"."$oid"' "$EXPORT_DIR/antigo.json" | tr -d '"')
do
	IMAGE="imagens/antigo/$i.*" # fica mais facil do que tar a ir a outro json ir buscar a extension
	cp $IMAGE "$EXPORT_DIR/antigo/"
	# let COUNT_ANTIGO++ # cursed
done

# COUNT_ATUAL=0
for i in $(jq '.[]."_id"."$oid"' "$EXPORT_DIR/atual.json" | tr -d '"')
do
	IMAGE="imagens/atual/$i.*" # fica mais facil do que tar a ir a outro json ir buscar a extension
	cp $IMAGE "$EXPORT_DIR/atual/"
	# let COUNT_ATUAL++ # cursed
done


# all files are now ready to tar. to make it prettier, going to use pv to monitor the time taken
# need size of files in order to do that
# will be kept in metadata file

SIZE=$(du --bytes --total "$EXPORT_DIR/" | tail -n 1 | cut -f 1)

# echo "{\"size\": $SIZE, \"sha256_streets\":$SHA_STREETS, \"ssha256_dates\":$SHA256_DATES, \"sha256_entities\":$SHA256_ENTITIES, \"sha256_places\":$SHA256_PLACES,\
# \"ssha256_antigo\":$SHA256_ANTIGO, \"sha256_atual\":$SHA256_ATUAL, \"sha256_imagens_antigo\":$SHA256_IMAGENS_ANTIGO, \"sha256_imagens_atual\":$SHA256_IMAGENS_ATUAL}" | jq > "$EXPORT_DIR/manifest.json"

# a lista de ficheiros de imagens nao fica no manifesto pois ja esta no json das imagens antigas e atuais

# adicionar coisas ao manifesto
echo "{\"meta\": {\"size\": $SIZE}, \"dados\": {}}" | jq > "manifest.json"
jq ".dados += {\"streets\": {\"collection\": \"streets\", \"filename\": \"streets.json\", \"records\": $STREETS_RECORDS}}" "manifest.json" > "manifest_tmp.json" && mv "manifest_tmp.json" "manifest.json"
jq ".dados += {\"dates\": {\"collection\": \"dates\", \"filename\": \"dates.json\", \"records\": $DATES_RECORDS}}" "manifest.json" > "manifest_tmp.json" && mv "manifest_tmp.json" "manifest.json"
jq ".dados += {\"entities\": {\"collection\": \"entities\", \"filename\": \"entities.json\", \"records\": $ENTITIES_RECORDS}}" "manifest.json" > "manifest_tmp.json" && mv "manifest_tmp.json" "manifest.json"
jq ".dados += {\"places\": {\"collection\": \"places\", \"filename\": \"places.json\", \"records\": $PLACES_RECORDS}}" "manifest.json" > "manifest_tmp.json" && mv "manifest_tmp.json" "manifest.json"
jq ".dados += {\"antigo\": {\"collection\": \"antigo\", \"filename\": \"antigo.json\", \"records\": $ANTIGO_RECORDS}}" "manifest.json" > "manifest_tmp.json" && mv "manifest_tmp.json" "manifest.json"
jq ".dados += {\"atual\": {\"collection\": \"atual\", \"filename\": \"atual.json\", \"records\": $ATUAL_RECORDS}}" "manifest.json" > "manifest_tmp.json" && mv "manifest_tmp.json" "manifest.json"
jq ".dados += {\"comments\": {\"collection\": \"comments\", \"filename\": \"comments.json\", \"records\": $COMMENTS_RECORDS}}" "manifest.json" > "manifest_tmp.json" && mv "manifest_tmp.json" "manifest.json"
jq ".dados += {\"users\": {\"collection\": \"users\", \"filename\": \"users.json\", \"records\": $USERS_RECORDS}}" "manifest.json" > "manifest_tmp.json" && mv "manifest_tmp.json" "manifest.json"
# jq ".dados += {\"imagens\": {\"atual\": {}, \"antigo\": {}}}" "manifest.json" > "manifest_tmp.json" && mv "manifest_tmp.json" "manifest.json"


# por fim, fazemos o tar.xz ja com acesso ao pv e xz
echo "Compressing files"
# see https://stackoverflow.com/questions/66329515/output-of-pv-on-docker-compose-startup-not-working-as-expected
(cd "$EXPORT_DIR/" && tar -c -f - --owner=0 --group=0 --no-same-owner --no-same-permissions * | pv --force -s $SIZE | xz --threads=0 --stdout > "../files.tar.xz")

# fazer um tar para poder meter o manifesto la dentro (nao o comprimimos)
echo "Final tar"
tar -c -f "$EXPORT_FILENAME" --owner=0 --group=0 --no-same-owner --no-same-permissions "manifest.json" "files.tar.xz"

rm "files.tar.xz"
rm "manifest.json"
rm -r "$EXPORT_DIR/"

echo "Export finished"
