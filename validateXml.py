import os
import xmlschema

def validate_xml_files(directory, xsd_path):

    schema = xmlschema.XMLSchema(xsd_path)

    xml_files = [f for f in os.listdir(directory) if f.endswith('.xml')]

    validation_results = {}

    for xml_file in xml_files:
        xml_path = os.path.join(directory, xml_file)
        try:
            # validate  XML file
            schema.validate(xml_path)
            validation_results[xml_file] = "Valid"
            
        except xmlschema.XMLSchemaValidationError as e:
            validation_results[xml_file] = f"Invalid: {e}"
    
    return validation_results

directory_path = 'datasets/MapaRuas-materialBase/texto/'
xsd_path = 'datasets/MapaRuas-materialBase/MRB-rua.xsd'
results = validate_xml_files(directory_path, xsd_path)

for file, result in results.items():
    print(f"{file}: {result}")



