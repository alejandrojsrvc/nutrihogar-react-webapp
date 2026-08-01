import type { ConnectivityGateway } from '../../application/ports/ConnectivityGateway';

export class BrowserConnectivityGateway implements ConnectivityGateway {
  isOnline() {
    return typeof navigator === 'undefined' || navigator.onLine;
  }
}
