#!/usr/bin/env python3

# python3 convert.py MapaRuas-materialBase/texto/ MapaRuas-materialBase/atual/

import json
import re as regex
from sys import argv
from os import mkdir 
from lxml import etree
from pathlib import Path
import re 

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
                rua_data = {"_id": file["_id"], "name": file["name"]} # mais tarde meter isto só com id, e fazer query dos nomes das respetivas ruas, mas para já é facil assim para mostrar no UI
                id_dict[item] = {"_id": str(idCounter), "name": item, "ruas": [rua_data]} 
                idCounter = idCounter + 1
            else:
                id_dict[item]["ruas"].append(rua_data)
    
    return id_dict

def update_jsons_with_ids(filesJSON: list, places_dict: dict, entities_dict: dict, dates_dict: dict):
    for _, json_data in filesJSON:
        json_data["places"] = [places_dict[place]["_id"] for place in json_data["places"]]
        json_data["entities"] = [entities_dict[entity]["_id"] for entity in json_data["entities"]]
        json_data["dates"] = [dates_dict[date]["_id"] for date in json_data["dates"]]

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
    dumpToJson(sorted_jsonsOnly, './parsed/streets.json')
    
    #write places, entities, dates
    dumpToJson(list(places_dict.values()), './parsed/places.json')
    dumpToJson(list(entities_dict.values()), './parsed/entities.json')
    dumpToJson(list(dates_dict.values()), './parsed/dates.json')
