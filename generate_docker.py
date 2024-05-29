import subprocess
import sys

def generate_docker_compose(db_name, collections_files, container_name):
    mongoimport_commands = ""
    for collection, json_file in collections_files:
        mongoimport_commands += f"mongoimport --host mongodb -d {db_name} -c {collection} --type json --file /datasets/{json_file} --jsonArray && "
    
    mongoimport_commands = mongoimport_commands.rstrip(' && ')

    docker_compose_template = f"""
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    depends_on:
      - mongo-seed
  mongo-seed:
    container_name: {container_name}-mongo-seed
    image: mongo:latest
    volumes:
"""
    for _, json_file in collections_files:
        docker_compose_template += f"      - {json_file}:/datasets/{json_file}\n"

    docker_compose_template += f"""
    command: /bin/bash -c "{mongoimport_commands}"
"""

    with open("docker-compose.yml", "w") as f:
        f.write(docker_compose_template)

def start_container():
    subprocess.run(["docker-compose", "up", "-d"])

if __name__ == "__main__":
    if len(sys.argv) < 5 or len(sys.argv[3:]) % 2 != 0:
        print("Usage: python script.py <db_name> <container_name> <collection_name1> <json_file_path1> [<collection_name2> <json_file_path2> ...]")
        sys.exit(1)

    db_name = sys.argv[1]
    container_name = sys.argv[2]
    collections_files = list(zip(sys.argv[3::2], sys.argv[4::2]))

    generate_docker_compose(db_name, collections_files, container_name)
    start_container()