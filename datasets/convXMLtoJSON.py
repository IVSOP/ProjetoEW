#!/usr/bin/env python3

# python3 convert.py MapaRuas-materialBase/texto/ MapaRuas-materialBase/atual/

import json
import re as regex
from sys import argv
from os import mkdir
from os import path
from lxml import etree
from pathlib import Path
import re
import subprocess
import json
import pymongo
import shutil

mongo = pymongo.MongoClient("mongodb://localhost:27017/")

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

def dumpToJson(jsonArray, filepath):
    with open(filepath,"w") as jsonFile:
        json.dump(jsonArray, jsonFile, ensure_ascii=False, indent=4)


##handlers XML
def handleMeta(meta):
    jsonMeta = {}
    jsonMeta['_id'] = meta.find('número').text
    jsonMeta['name'] = meta.find('nome').text
    return jsonMeta


def handleCorpo(corpo):

    descricao = []
    lugares = []
    entidades = []
    datas = []

    regex_spaces = re.compile(r'\n|\t|\s{2,}')
    for corpoElement in corpo.findall('para'):
        text = ''
        for textNode in corpoElement.itertext():
            text += textNode
        text = text.strip()
        text = regex_spaces.sub(r'',text)
        descricao.append(text)

        #extrair lugar, entidades, datas
        for lugar in corpoElement.findall('lugar'):
            lugares.append(regex_spaces.sub(r' ',lugar.text.strip()))

        for entidade in corpoElement.findall('entidade'):
            entidades.append(regex_spaces.sub(r' ',entidade.text.strip()))
        
        for data in corpoElement.findall('data'):
            datas.append(regex_spaces.sub(r' ',data.text.strip()))

    jsonCorpo = {}
    jsonCorpo['description'] = descricao
    jsonCorpo['places'] = lugares
    jsonCorpo['entities'] = entidades
    jsonCorpo['dates'] = datas

    return jsonCorpo


def handleOldFiguras(figuras):

    jsonFiguras = {}
    jsonFiguras['old_images'] = []

    for figura in figuras:
        jsonFiguras['old_images'].append({
            '_id': figura.get('id'),
            'path': figura.find('imagem').get('path'),
            'subst': figura.find('legenda').text
        })

    return jsonFiguras

def handleCasas(casas):

    jsonCasas = {}
    jsonCasas['houses'] = []

    for casa in casas:

        desc = []
        vista = ''
        enfiteuta = ''
        foro = ''

        if casa.find('vista') is not None:
            vista = casa.find('vista').text

        if casa.find('enfiteuta') is not None:
            enfiteuta = casa.find('enfiteuta').text

        if casa.find('foro') is not None:
            foro = casa.find('foro').text

        if casa.find('desc') is not None:

            for paragraph in casa.find('desc').findall('para'):
                text = ''
                for textNode in paragraph.itertext():
                    text += textNode
                text = text.strip()
                text = regex.sub(r'\n|\t|\s{2,}',r'',text)
                desc.append(text)  

        jsonCasas['houses'].append({
            '_id': casa.find('número').text,
            'enfiteuta': enfiteuta,
            'subst': foro,
            'vista': vista,
            'desc': desc
        })

    return jsonCasas


def xmlToJson(xmlFile):

    print(xmlFile)

    tree = etree.parse(xmlFile)
    root = tree.getroot()

    jsonDB = handleMeta(root.find('meta'))
    jsonDB.update(handleCorpo(root.find('corpo')))
    jsonDB.update(handleOldFiguras(root.find('corpo').findall('figura')))

    if root.find('corpo').find('lista-casas') is not None:
        jsonDB.update(handleCasas(root.find('corpo').find('lista-casas').findall('casa')))

    return jsonDB


def handleNewFiguras(files,id):

    jsonFiguras = {}
    jsonFiguras['new_images'] = []

    for file in files:
        if file.name.startswith(f'{id}-'):
            jsonFiguras['new_images'].append(f'../atual/{file.name}')

    return jsonFiguras

#id parsers
def calc_ids(filesJSON, target_field: str) -> dict:
    id_dict = dict()

    idCounter = 1
    
    for (_,file) in filesJSON:
        #parse places
        for item in file.get(target_field,[]):
            if item not in id_dict:
                rua_data = file["_id"]
                id_dict[item] = {"_id": str(idCounter), "name": item, "ruas": {rua_data}} 
                idCounter = idCounter + 1
            else:
                id_dict[item]["ruas"].add(rua_data)

    for (_,val) in id_dict.items():
        val["ruas"] = sorted(list(val["ruas"]), key=lambda x: int(x)) # converter sets de ids de ruas em lista, para ser serializável

    return id_dict

def update_jsons_with_ids(filesJSON: list, places_dict: dict, entities_dict: dict, dates_dict: dict):
    for _, json_data in filesJSON:
        json_data["places"] = sorted(set([places_dict[place]["_id"] for place in json_data["places"]]), key=lambda x: int(x))
        json_data["entities"] = sorted(set([entities_dict[entity]["_id"] for entity in json_data["entities"]]), key=lambda x: int(x))
        json_data["dates"] = sorted(set([dates_dict[date]["_id"] for date in json_data["dates"]]), key=lambda x: int(x))

		# translate imagens das ruas, aqui por simplicidade
        for old_image in json_data["old_images"]:
            image_path = path.basename(old_image["path"])
            image = loadImage("antigo", image_path, old_image["subst"])
            old_image = {"_id" : image["_id"]}

        for new_image_path in json_data["new_images"]:
            image_path = path.basename(new_image_path)
            image = loadImage("atual", image_path, new_image_path)
            old_image = {"_id" : image["_id"]}

def insert_mongo(collection, data):
    col = mongo['proj_ruas'][collection]
    inserted = len(col.insert_many(data).inserted_ids)
    print(f"{collection} -> OK: {inserted} ERROR: {len(data) - inserted}")

#main func
if __name__ == '__main__':

    inFile = argv[1]
    filesJSON = [] # lista com filenames e jsons correspondentes
    atualImages = [file for file in Path(argv[2]).iterdir() if file.is_file()]
    XMLFiles = [file for file in Path(argv[1]).iterdir() if file.is_file()]
    Path('parsed').mkdir(parents=True,exist_ok=True)

    # initial convert from xml to json
    for XMLFile in XMLFiles:
        #construct initial json files from xml filmes
        jsonFilePath = './parsed/streets/' + str(XMLFile.name).replace('xml','json')
        jsonDB = xmlToJson(str(XMLFile.resolve()))
        jsonDB.update(handleNewFiguras(atualImages,regex.search(r'[1-9]\d*',str(XMLFile.resolve())).group(0)))

        filesJSON.append((jsonFilePath,jsonDB))

    #create ids for places, entities, dates
    places_dict = calc_ids(filesJSON, "places")
    entities_dict = calc_ids(filesJSON, "entities")
    dates_dict = calc_ids(filesJSON, "dates")

    #update jsons with respective ids
    update_jsons_with_ids(filesJSON, places_dict, entities_dict, dates_dict)
    
    # descomentar isto, se preferirem meter em ficheiros separados
    #write final json contents to new files
    # Path('parsed/streets').mkdir(parents=True,exist_ok=True)
    # for (filepath, jsonData) in filesJSON:
    #     with open(filepath,'w') as jsonFile:
    #      
    # jsonFile.write(json.dumps(jsonData,ensure_ascii=False,indent=4))

    #escrever só para um ficheiro as entradas todas
    jsonsOnly = [tup[1] for tup in filesJSON]
    sorted_jsonsOnly = sorted(jsonsOnly, key=lambda x: int(x['_id']))
    # dumpToJson(sorted_jsonsOnly, './parsed/streets.json')
    
    #write places, entities, dates
    # dumpToJson(list(places_dict.values()), './parsed/places.json')
    # dumpToJson(list(entities_dict.values()), './parsed/entities.json')
    # dumpToJson(list(dates_dict.values()), './parsed/dates.json')
    
	# import these jsons into mongo
    # places = mongo["proj_ruas"][collection]
    # entities = mongo["proj_ruas"][collection]
    # dates = mongo["proj_ruas"][collection]

    insert_mongo('streets', sorted_jsonsOnly)
    insert_mongo('places', list(places_dict.values()))
    insert_mongo('entities', list(entities_dict.values()))
    insert_mongo('dates', list(dates_dict.values()))
