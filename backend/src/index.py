from flask import Flask, jsonify, request, send_file
from livereload import Server
from flask_cors import CORS, cross_origin
import base64
import os 
import io
import librosa
import librosa.display
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

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

  #filename = 'emoji.png' # Sample image in the src/ folder. This can be the dynamic image generated from librosa
  #image_file = open(os.path.join(dir_path, filename), "rb")
  #encoded_string = base64.b64encode(image_file.read())

    #request_body - the waveform
    #scale - eg. linear, log, cqt_note, cqt_hz (constant q transform)
    #sr - the sample rate

    # set sr for now
    w = np.array(request_body["sound_data"])
    sr = 22050
    scale = "log"

    # clear plot first
    plt.clf()

    D = librosa.amplitude_to_db(np.abs(librosa.stft(w)), ref=np.max)
    librosa.display.specshow(D, y_axis=scale,x_axis="time", sr=sr)
    plt.colorbar(format='%+2.0f dB')
    plt.title(scale+'-frequency power spectrogram')
    
    # save to base64
    pic_IObytes = io.BytesIO()
    plt.savefig(pic_IObytes,  format='png')
    pic_IObytes.seek(0)
    encoded_string = base64.b64encode(pic_IObytes.read())
    
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
