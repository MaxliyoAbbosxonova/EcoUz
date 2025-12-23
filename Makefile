mig:
	python manage.py makemigrations
	python manage.py migrate

sup:
	python manage.py createsuperuser

run:
	python manage.py runserver

msg:
	python manage.py makemessages -l uz -l en

convert_webp:
	python manage.py convert_images_to_webp

compile_msg:
	python manage.py compilemessages -i .venv

loaddata:
	python3 manage.py loaddata applications regions districts
mig2:
	docker compose exec -it backend_service sh -c 'uv run python3 manage.py makemigrations'
	docker compose exec -it backend_service sh -c 'uv run python3 manage.py migrate'

flake:
	flake8 .

isort:
	isort .

docker:
	sudo systemctl stop redis
	docker start postgres_container redis_container

front:
	python3 -m http.server 3000