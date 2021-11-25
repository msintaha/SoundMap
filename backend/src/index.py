from flask import Flask, jsonify, request, send_file
from livereload import Server
from flask_cors import CORS, cross_origin
import base64
import os 

dir_path = os.path.dirname(os.path.realpath(__file__))

app = Flask(__name__)
cors = CORS(app)

if __name__ == '__main__':
    server = Server(app.wsgi_app)
    server.serve()

incomes = [
  { 'description': 'salary', 'amount': 5000 }
]



@app.route('/api/generate-spectrogram', methods=['POST'])
@cross_origin()
def generate_spectrogram():
  request_body = request.get_json()
  print('Data', request_body)

  filename = 'emoji.png' # Sample image in the src/ folder. This can be the dynamic image generated from librosa
  image_file = open(os.path.join(dir_path, filename), "rb")
  encoded_string = base64.b64encode(image_file.read())

  return "data:image/jpg;base64," + encoded_string.decode('utf-8')

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
