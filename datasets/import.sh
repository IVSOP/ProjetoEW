#!/usr/bin/bash

# mongoimport -d proj_ruas -c atual ... --jsonArray
# mongoimport -d proj_ruas -c antigo ... --jsonArray

mongoimport -d proj_ruas -c streets parsed/streets.json --jsonArray
mongoimport -d proj_ruas -c places parsed/places.json --jsonArray
mongoimport -d proj_ruas -c dates parsed/dates.json --jsonArray
mongoimport -d proj_ruas -c entities parsed/entities.json --jsonArray
