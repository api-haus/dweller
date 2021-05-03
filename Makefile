compose-build:
	docker-compose build

run: compose-build
	docker-compose run dweller collect
