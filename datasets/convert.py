import json
import re as regex
from sys import argv
from os import mkdir 
from lxml import etree
from pathlib import Path


def handleMeta(meta):
    jsonMeta = {}
    jsonMeta['id'] = meta.find('número').text
    jsonMeta['name'] = meta.find('nome').text
    return jsonMeta


def handleCorpo(corpo):

    jsonCorpo = {}
    jsonCorpo['description'] = []

    for corpoElement in corpo.findall('para'):
        text = ''
        for textNode in corpoElement.itertext():
            text += textNode
        text = text.strip()
        text = regex.sub(r'\n|\t|\s{2,}',r'',text)
        jsonCorpo['description'].append(text)

    return jsonCorpo


def handleOldFiguras(figuras):

    jsonFiguras = {}
    jsonFiguras['old_images'] = []

    for figura in figuras:
        jsonFiguras['old_images'].append({
            'id': figura.get('id'),
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
            'id': casa.find('número').text,
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


if __name__ == '__main__':

    inFile = argv[1]
    atualImages = [file for file in Path(argv[2]).iterdir() if file.is_file()]
    XMLFiles = [file for file in Path(argv[1]).iterdir() if file.is_file()]
    Path('json').mkdir(parents=True,exist_ok=True)

    for XMLFile in XMLFiles:

        with open('./json/' + str(XMLFile.name).replace('xml','json'),'w') as jsonFile:
            jsonDB = xmlToJson(str(XMLFile.resolve()))
            jsonDB.update(handleNewFiguras(atualImages,regex.search(r'\d+',str(XMLFile.resolve())).group(0)))
            jsonFile.write(json.dumps(jsonDB,ensure_ascii=False,indent=4))