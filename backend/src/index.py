from flask import Flask, jsonify, request
from livereload import Server
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)

if __name__ == '__main__':
    server = Server(app.wsgi_app)
    server.serve()

incomes = [
  { 'description': 'salary', 'amount': 5000 }
]

@app.route('/')
def get():
  return 'Hello World'

@app.route('/api')
@cross_origin()
def get_incomes():
  return jsonify(incomes)


@app.route('/api/incomes', methods=['POST'])
def add_income():
  incomes.append(request.get_json())
  return '', 204
