#!/usr/bin/env python3

# python3 convert.py MapaRuas-materialBase/texto/ MapaRuas-materialBase/atual/

import json
import shutil
import pymongo
import re as regex
from sys import argv
from os import path
from lxml import etree
from pathlib import Path

# mongo = pymongo.MongoClient("mongodb://localhost:27017/")
mongo = pymongo.MongoClient("mongodb://mongodb:27017/")

# loadImage('antigo', 'MapaRuas-materialBase/antigo/MRB-16-RuaDeDGualdim-Nascente.jpg', 'uma imagem')
def loadImage(collection, filepath, subst):
    filename, file_extension = path.splitext(filepath)

    # json da imagem
    image = {
        'subst': subst,
        'extension': file_extension[1:]
    }

    imagens = mongo["proj_ruas"][collection]

	# carregar para o mongo
    # import_cmd = f"""bash -c 'mongoimport -d proj_ruas -c {collection} <(echo '{json.dumps(image)}')'""" desisto isto nao funciona
    result = imagens.insert_one(image)

    image["_id"] = result.inserted_id

    shutil.copy('MapaRuas-materialBase/' + collection + '/' + filepath, f"""parsed/{collection}/{image["_id"]}.{image['extension']}""") # or use os.rename

    return image


## Write json to file
def dumpToJson(jsonArray,filepath):
    with open(filepath,"w") as jsonFile:
        json.dump(jsonArray, jsonFile, ensure_ascii=False, indent=4)


## Insert a given collection in mongodb
def insert_mongo(collection,data):
    col = mongo['proj_ruas'][collection]
    inserted = len(col.insert_many(data).inserted_ids)
    print(f"{collection} -> OK: {inserted} ERROR: {len(data) - inserted}")


## Parse XML meta content
def parseMeta(root):
    jsonMeta = {}
    jsonMeta['_id'] = root.find('meta').find('número').text
    jsonMeta['name'] = root.find('meta').find('nome').text
    return jsonMeta


## Parse XML street description
def parseDescription(root):

    jsonDescription = {'description': []}

    for element in root.find('corpo').findall('para'):
        text = ''.join(element.itertext())
        text = regex.sub(r'\n|\t|\s{2,}',r' ',text.strip())
        jsonDescription['description'].append(text)

    return jsonDescription


## Parse XML old images
def parseOldImages(root):

    jsonOldImages = {'old_images': []}
    figuras = root.find('corpo').findall('figura')

    for figura in figuras:
        jsonOldImages['old_images'].append({
            '_id': figura.get('id'),
            'path': figura.find('imagem').get('path'),
            'subst': figura.find('legenda').text
        })

    return jsonOldImages


## Parse XML houses
def parseHouses(root):

    casas = []
    jsonHouses = {'houses': []}

    if root.find('corpo').find('lista-casas') is not None:
        casas = root.find('corpo').find('lista-casas').findall('casa')

    for casa in casas:

        house = {
            'foro': '',
            'vista': '',
            'enfiteuta': '',
            'desc': []
        }

        if casa.find('vista') is not None:
            house['vista'] = casa.find('vista').text

        if casa.find('enfiteuta') is not None:
            house['enfiteuta'] = casa.find('enfiteuta').text

        if casa.find('foro') is not None:
            house['foro'] = casa.find('foro').text

        if casa.find('desc') is not None:
            for paragraph in casa.find('desc').findall('para'):
                text = ''.join(paragraph.itertext())
                text = regex.sub(r'\n|\t|\s{2,}',r' ',text.strip())
                house['desc'].append(text)

        jsonHouses['houses'].append(house)

    return jsonHouses


## Get all new images
def parseNewImages(newImages,id):

    jsonFiguras = {'new_images': []}

    for image in newImages:
        if image.name.startswith(f'{id}-'):
            jsonFiguras['new_images'].append(f'../atual/{image.name}')

    return jsonFiguras

#script abre n vezes o mesmo ficheiro, nas só se corre uma vez o script
def addGeoCords(id):
    with open('./parsed/geoCords.json', 'r') as file:
        data = json.load(file)

    streetId = str(id)

    return data[streetId] # pode ser null ou não

## Parse a given XML file
def xmlToJson(xmlFile, newImages):

    tree = etree.parse(xmlFile)
    root = tree.getroot()
    id = regex.search(r'[1-9]\d*',xmlFile).group(0)

    jsonDB = parseMeta(root)
    jsonDB.update(parseDescription(root))
    jsonDB.update(parseHouses(root))
    jsonDB.update(parseOldImages(root))
    jsonDB.update(parseNewImages(newImages,id))

    jsonDB['places'] = [regex.sub(r'\n|\t|\s{2,}',r' ',x.text.strip()) for x in tree.xpath("//lugar")]
    jsonDB['entities'] = [regex.sub(r'\n|\t|\s{2,}',r' ',x.text.strip()) for x in tree.xpath("//entidade")]
    jsonDB['dates'] = [regex.sub(r'\n|\t|\s{2,}',r' ',x.text.strip()) for x in tree.xpath("//data")]
    jsonDB['geoCords'] = addGeoCords(id)

    return jsonDB


## ID's parser
def calcIDs(streets, target: str) -> dict:

    ids = dict()
    idCounter = 1

    for street in streets:
        for item in street[target]:
            if item not in ids:
                ids[item] = {
                    "_id": str(idCounter),
                    "name": item,
                    "ruas": {street['_id']}}
                idCounter += 1
            else:
                ids[item]["ruas"].add(street['_id'])

    for id in ids:
        ids[id]['ruas'] = sorted(list(ids[id]['ruas']), key=lambda x: int(x))

    return ids


## Convert street places, entities, dates to ID's
def updateStreets(streets,dates,places,entities):

    for street in streets:

        street["dates"] = sorted(set([dates[x]["_id"] for x in street["dates"]]), key=lambda x: int(x))
        street["places"] = sorted(set([places[x]["_id"] for x in street["places"]]), key=lambda x: int(x))
        street["entities"] = sorted(set([entities[x]["_id"] for x in street["entities"]]), key=lambda x: int(x))

        old_images = []
        new_images = []

        for old_image in street["old_images"]:
            image_path = path.basename(old_image["path"])
            image = loadImage("antigo", image_path, old_image["subst"])
            old_images.append({"_id" : image["_id"]})

        for new_image_path in street["new_images"]:
            image_path = path.basename(new_image_path)
            image = loadImage("atual", image_path, new_image_path)
            new_images.append({"_id" : image["_id"]})

        street["old_images"] = old_images
        street["new_images"] = new_images


if __name__ == '__main__':

    jsonDBs = {
        'streets': [],
        'dates': [],
        'places': [],
        'entities': []
    }

    XMLFiles = [file for file in  Path(argv[1]).iterdir() if file.is_file()]
    newImages = [file for file in Path(argv[2]).iterdir() if file.is_file()]

    ## Create folders if they don't exist
    Path('parsed').mkdir(parents=True,exist_ok=True)
    Path('parsed/antigo').mkdir(parents=True,exist_ok=True)
    Path('parsed/atual').mkdir(parents=True,exist_ok=True)

    ## Convert from xml to json
    for XMLFile in XMLFiles:
        xmlFileName = str(XMLFile.resolve())
        jsonDBs['streets'].append(xmlToJson(xmlFileName,newImages))

    jsonDBs['dates'] = calcIDs(jsonDBs['streets'],'dates')
    jsonDBs['places'] = calcIDs(jsonDBs['streets'],'places')
    jsonDBs['entities'] = calcIDs(jsonDBs['streets'],'entities')

    updateStreets(
        jsonDBs['streets'],
        jsonDBs['dates'],
        jsonDBs['places'],
        jsonDBs['entities'])

    # create ids for places, entities, dates
    # places_dict = calc_ids(filesJSON, "places")
    # entities_dict = calc_ids(filesJSON, "entities")
    # dates_dict = calc_ids(filesJSON, "dates")

    # update jsons with respective ids
    # update_jsons_with_ids(filesJSON, places_dict, entities_dict, dates_dict)

    # escrever só para um ficheiro as entradas todas
    # jsonsOnly = [tup[1] for tup in filesJSON]
    # sorted_jsonsOnly = sorted(jsonsOnly, key=lambda x: int(x['_id']))
    # dumpToJson(sorted_jsonsOnly, './parsed/streets.json')

    # write places, entities, dates
    # dumpToJson(list(places_dict.values()), './parsed/places.json')
    # dumpToJson(list(entities_dict.values()), './parsed/entities.json')
    # dumpToJson(list(dates_dict.values()), './parsed/dates.json')

	# import these jsons into mongo
    # places = mongo["proj_ruas"][collection]
    # entities = mongo["proj_ruas"][collection]
    # dates = mongo["proj_ruas"][collection]

    # ler users
    with open('./parsed/users.json', 'r') as file:
        users_data = json.load(file)

    insert_mongo('streets',jsonDBs['streets'])
    insert_mongo('dates',list(list(jsonDBs['dates'].values())))
    insert_mongo('places',list(list(jsonDBs['places'].values())))
    insert_mongo('entities',list(list(jsonDBs['entities'].values())))
    insert_mongo('users',users_data)