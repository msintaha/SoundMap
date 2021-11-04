#!/bin/sh
export FLASK_APP=./src/index.py
export FLASK_ENV=development

flask run -h 127.0.0.1
