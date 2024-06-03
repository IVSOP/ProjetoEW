FROM python:latest
WORKDIR /datasets
RUN pip install lxml && pip install pymongo
# COPY . .
CMD ["python3", "convXMLtoJSON.py", "MapaRuas-materialBase/texto/", "MapaRuas-materialBase/atual/"]
