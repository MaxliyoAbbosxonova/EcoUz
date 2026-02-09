mig:
	python manage.py makemigrations
	python manage.py migrate

sup:
	python manage.py createsuperuser
run:
	python manage.py runserver

msg:
	python manage.py makemessages -l en -l ru -l uz

compile_msg:
	python manage.py compilemessages -i .venv

convert_webp:
	python manage.py convert_images_to_webp

loaddata:
	python3 manage.py loaddata results
mig2:
	docker compose exec -it backend_service sh -c 'uv run python3 manage.py makemigrations'
	docker compose exec -it backend_service sh -c 'uv run python3 manage.py migrate'

flake:
	flake8 .

isort:
	isort .

docker:
	sudo systemctl stop redis
	docker start  postgres_container redis_container

front:
	python3 -m http.server 3000
know_3000:
	 sudo lsof -i :3000
off_port:
	 sudo kill -9 7554


