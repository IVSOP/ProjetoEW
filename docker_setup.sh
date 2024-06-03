#!/usr/bin/bash

rm datasets/parsed/atual/*
rm datasets/parsed/antigo/*

rm servico_dados/imagens/atual/*
rm servico_dados/imagens/antigo/*

docker-compose -p proj_ruas -f docker-compose-setup.yml up --build

cp -r datasets/parsed/antigo servico_dados/imagens
cp -r datasets/parsed/atual servico_dados/imagens
