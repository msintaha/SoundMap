import http from '../utils/http';

export default class Service {
  static list() {
    return http.get('').then(response => response.data);
  }
}
