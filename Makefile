start:
	make start-services && make start-clay

start-services:
	docker-compose up -d nginx postgres redis elasticsearch

start-clay:
	cd app && npm i && npm run start:dev

stop-services:
	docker-compose stop nginx postgres redis elasticsearch

remove-containers:
	@echo "Removing all stopped containers..."
	docker-compose rm nginx postgres redis elasticsearch

burn:
	@echo "Stopping and removing all containers..."
	make stop-services && make remove-containers

clear-data:
	rm -rf ./elasticsearch/data && rm -rf ./redis/data && rm -rf ./postgres/data

clear-public:
	rm -rf ./app/public/* && rm -f ./app/browserify-cache.json

build:
	cd app && clay compile --inlined --linked --reporter pretty && cd ..

bootstrap:
	cat ./bootstrap-starter-data/* | clay import -k starter -y localhost

bootstrap-user:
	cat sample_users.yml | clay import -k starter -y localhost

add-access-key:
	clay config --key starter accesskey

default: start
