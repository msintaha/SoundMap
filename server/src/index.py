from flask import Flask, jsonify, request, send_file
from livereload import Server
from flask_cors import CORS, cross_origin
import base64
import os 
import io
import librosa
import librosa.display
import matplotlib
import matplotlib.pyplot as plt
import numpy as np


dir_path = os.path.dirname(os.path.realpath(__file__))
matplotlib.use('Agg')

app = Flask(__name__)
cors = CORS(app)

if __name__ == '__main__':
    server = Server(app.wsgi_app)
    server.serve()


@app.route('/api/generate-spectrogram', methods=['POST'])
@cross_origin()
def generate_spectrogram():
    request_body = request.get_json()
    # set sr for now
    w = np.array(request_body["sound_data"])
    sr = request_body["sample_rate"]
    scale = "log"

    # clear plot first
    plt.clf()

    D = librosa.amplitude_to_db(np.abs(librosa.stft(w)), ref=np.max)
    librosa.display.specshow(D, y_axis=scale, x_axis="time", sr=sr)
    plt.colorbar(format='%+2.0f dB')
    plt.title(scale+'-frequency power spectrogram')

    # save to base64
    pic_IObytes = io.BytesIO()
    plt.savefig(pic_IObytes,  format='png')
    pic_IObytes.seek(0)
    encoded_string = base64.b64encode(pic_IObytes.read())
    
    return "data:image/png;base64," + encoded_string.decode('utf-8')

@app.route('/api/generate-waveplot', methods=['POST'])
@cross_origin()
def generate_waveplot():
    request_body = request.get_json()
    # set sr for now
    w = np.array(request_body["sound_data"])
    sr = request_body["sample_rate"]

    # clear plot first
    plt.clf()

    librosa.display.waveplot(w, sr)
    plt.title('Waveplot')

    # save to base64
    pic_IObytes = io.BytesIO()
    plt.savefig(pic_IObytes, format='png')
    pic_IObytes.seek(0)
    encoded_string = base64.b64encode(pic_IObytes.read())

    return "data:image/png;base64," + encoded_string.decode('utf-8')

@app.route('/')
def get():
	return 'Hello World'
