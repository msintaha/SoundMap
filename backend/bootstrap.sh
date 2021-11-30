#!/bin/sh
export FLASK_APP=./src/index.py
export FLASK_ENV=development

flask run -h localhost -p 5051
