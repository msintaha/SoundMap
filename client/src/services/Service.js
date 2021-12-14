import http from '../utils/http';

export default class Service {
  static list() {
    return http.get('').then(response => response.data);
  }

  static generateSpectrogram(data) {
    return http.post('/generate-spectrogram', data).then(response => response.data);
  }

  static generateWaveplot(data) {
    return http.post('/generate-waveplot', data).then(response => response.data);
  }
}
