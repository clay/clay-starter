start:
	docker-compose up

rebuild:
	ssh-add -l > /dev/null 2>&1 || { eval "$$(ssh--agent)" && ssh-add; }
	export DOCKER_BUILDKIT=1 \
		&& docker build --progress=plain --ssh=default -t starter-internal . \
		&& docker-compose up

stop:
	docker-compose stop

burn:
	@echo "Stopping and removing all containers..."
	docker-compose down

clear-data:
	docker-compose down --volumes

clear-public:
	docker-compose exec clay rm -rf public/*
	docker-compose exec clay rm -f browserify-cache.json

build:
	docker-compose exec clay npm run build

bootstrap:
	cat ./bootstrap-starter-data/* | clay import -k starter -y localhost

bootstrap-user:
	cat sample_users.yml | clay import -k starter -y localhost

add-access-key:
	clay config --key starter accesskey

default: start
