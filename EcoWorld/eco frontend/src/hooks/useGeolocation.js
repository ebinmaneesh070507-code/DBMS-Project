import { useCallback, useState } from 'react';

// Wraps the browser's Geolocation API with loading/error state so pages
// don't have to duplicate this. No location is ever sent anywhere until
// the calling page explicitly submits a form with it.
export function useGeolocation() {
  const [coords, setCoords] = useState(null); // { lat, lng, accuracy }
  const [status, setStatus] = useState('idle'); // idle | locating | done | error
  const [error, setError] = useState('');

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('error');
      setError('Geolocation is not supported by this browser.');
      return;
    }
    setStatus('locating');
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setStatus('done');
      },
      (err) => {
        setStatus('error');
        setError(err.message || 'Could not get your location.');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, []);

  return { coords, status, error, locate };
}
