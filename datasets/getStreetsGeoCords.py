from urllib.parse import quote
import requests
import json

# NOTA: script devolve maioria das coordenadas erradas, porque não
street_names = [
 "Rua do Campo",
 "Rua Nova",
 "Rua dos Açougues velhos",
 "Praça do Pão",
 "Rua das Oucias",
 " Rua do Souto Porta do Souto ",
 " Loura e Terreiro do Castelo  ",
 "Rua de Janes ",
 "Rua de S.João",
 "Travessa da Rua de S. João para a do Forno",
 "Rua dos Cegos ou do Forno",
 "Travessa Da Rua Do Forno Para A Do Poco",
 "Rua Pequena",
 "Rua de Sta. Maria ou do Poço",
 "Travessa da Rua do Poço para a de D.Gualdim",
 "Rua de D. Gualdim",
 "Travessa da Rua de D.Gualdim até ao Couto do Arvoredo",
 "Rua das Chagas",
 "Rua de Sto. António",
 "Terreiro de Sto. António e Postigo",
 "Rua Verde",
 "Rua de Maximinos",
 "Rua dos Sapateiros e Rossio da Praça",
 "Rua da Vielinha",
 "Campo de S. Sebastião e em Frente do Açougue",
 "Rua de S.Miguel O Anjo",
 "Rua Da Cruz De Pedra",
 "Rua Direita",
 "Rua do Beco",
 "Cangosta De S. Sebastião",
 "Rua do Alcaide",
 "Rua dos Pelames",
 "Campo de S. Tiago",
 "Cangosta das Cruzes",
 "Rua de S. Marcos",
 "Rua das Águas",
 "Rua de S. Lázaro",
 "Rua da Ponte de Guimarães",
 "Ponte de Guimarães",
 "Rua do Paymanta",
 "Campo de Santa Ana",
 "Campo e Calçada de Nossa Senhora a Branca",
 "Campo de Nossa Senhora a Branca. Rua da Régua. Rua Nova da Seara",
 "Rua da Fonte da Carcova",
 "Rua dos Chãos de Baixo",
 "Rua de Santo André",
 "Rua de S. Barnabé",
 "Praça do Gavião",
 "Rua de S. Gonçalo",
 "Rua de Nossa Senhora de Guadalupe",
 "Rua Da Oliveira",
 "Rua em Frente de Nossa Senhora de Guadalupe",
 "Rua dos Chãos de Cima",
 "Rua das Palhotas",
 "Rua de Infias",
 "Cangosta da Escoura",
 "Estrada de Real",
 "Rua da Cónega",
 "Rua dos Biscaínhos",
 "Cangosta da Rua das Águas"
 ]

def getGeoCords(streets_name):
    # obtive este url com parâmetros customizados de "https://docs.mapbox.com/playground/geocoding/"
    base_url = "https://api.mapbox.com/search/geocode/v6/forward?&country=pt&limit=3&types=street&language=pt&access_token=pk.eyJ1IjoicHJvamV3MjAyNCIsImEiOiJjbHhmYmFtZDEwaXB2MmlxcHRxZWh6NmkyIn0.u-B3ZAgVigR30lMTX7UgvQ"
    results = {}
    idCounter = 1

    for street_name in streets_name:
        url = f"{base_url}&q={quote(street_name)}%2C%20Braga%2C%20Portugal"

        response = requests.get(url)
        data = response.json()

        if data['features']:
            coordinates = data['features'][0]['geometry']['coordinates']
            results[idCounter] = {
                "longitude": str(coordinates[0]),
                "latitude": str(coordinates[1])
            }
        else:
            results[idCounter] = None
        
        idCounter += 1
    return results

if __name__ == '__main__':
    result = getGeoCords(street_names)
    with open ('./parsed/geoCords.json','w') as file:
        json.dump(result,file, ensure_ascii=False, indent=4)