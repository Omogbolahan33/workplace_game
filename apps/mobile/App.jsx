/* The phone app.

   The game is the single file, shipped inside the app and drawn in a WebView:
   one game, one set of screens, no second implementation of thirty screens that
   has to be kept in step. What is native is what a WebView cannot do - the
   device's storage, the share sheet, the status bar, the back button - and the
   simulation itself, which is installed on the host seam at boot so the native
   side can read the run (for a leaderboard, a notification, a widget) without
   the WebView being involved at all.

   Boot order matters and is the opposite of the web app's: there the ui is
   imported after the DOM exists; here the store is hydrated first, because a
   phone can be killed between a save and a flush, and asking the game about a
   save before the mirror is warm gives a wrong answer that looks like a fresh
   install. Hydrate, install the host, then draw. */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Asset } from 'expo-asset';
import { WebView } from 'react-native-webview';
import { makeHost, makeStore, shareGame, isAndroid } from './src/native';
import { parseFromGame, encodeToGame } from './src/bridge';

const GAME = require('./assets/game/index.html');
const WEB_URL = 'https://ledger.example.com/';

export default function App() {
  const [ready, setReady] = useState(null);      /* the local uri of the game */
  const [toast, setToast] = useState('');
  const [booted, setBooted] = useState(false);
  const web = useRef(null);
  const store = useMemo(() => makeStore(), []);

  const showToast = useCallback((text) => {
    setToast(String(text == null ? '' : text));
    setTimeout(() => setToast(''), 2600);
  }, []);

  /* the host the simulation is installed on: all eleven slots, RN APIs. It is
     built once the core is in hand - a host without core cannot save - so the
     two are assembled together in the boot effect below. */
  const [host, setHost] = useState(null);

  useEffect(() => {
    let dead = false;
    (async () => {
      const warm = await store.hydrate();
      if (dead) return;
      /* the simulation, installed before anything can ask it for a save: the
         host is built around the core module, because saving is reading the
         game's own state and writing it in the file's format */
      try {
        const core = await import('@ledger/core');
        const h = makeHost(core, { store, toast: showToast, url: () => WEB_URL, webUrl: WEB_URL });
        if (typeof core.installHost === 'function') core.installHost(h);
        if (!dead) setHost(h);
      } catch (e) {
        /* the core is a package in this workspace; if it is missing the app
           still draws the game - it just cannot answer the native side */
        if (__DEV__) console.warn('core not installed on the native host: ' + e.message);
      }
      /* and the game itself, unpacked from the bundle */
      try {
        const asset = Asset.fromModule(GAME);
        await asset.downloadAsync();
        if (dead) return;
        setReady({ uri: asset.localUri || asset.uri, warm });
      } catch (e) {
        setReady({ error: e.message, warm });
      }
    })();
    return () => { dead = true; store.flushNow(); };
  }, [store, showToast]);

  /* the back button belongs to the game before it belongs to the OS: an open
     modal closes, a sub-tab goes up, and only then does the app leave */
  useEffect(() => {
    if (!isAndroid) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const w = web.current;
      if (!w) return false;
      w.injectJavaScript(
        "(function(){var m=document.querySelector('#modalHost .modalbox');" +
        "if(m){var c=document.querySelector('#modalHost [data-a=\\'close\\']');if(c){c.click();return 'closed';}}" +
        "var s=document.querySelector('#subs [data-a=\\'sub\\'].on');" +
        "return 'handled';})(); true;");
      return true;                        /* handled here, never by the OS */
    });
    return () => sub.remove();
  }, []);

  const onMessage = useCallback(async (event) => {
    const msg = parseFromGame(event.nativeEvent.data);
    if (!msg) return;                     /* anything malformed is dropped, not trusted */
    const w = web.current;
    const reply = (type, body) => { if (w) w.postMessage(encodeToGame(type, body)); };
    switch (msg.type) {
      case 'ready': setBooted(true); break;
      case 'toast': showToast(msg.body.text); break;
      case 'share': await shareGame(msg.body.text || msg.body.url || ''); break;
      case 'save': store.set('save.' + (msg.body.key || 'auto'), String(msg.body.text)); reply('save', { ok: true }); break;
      case 'load': reply('load', { text: store.get('save.' + (msg.body.key || 'auto')) }); break;
      case 'keys': reply('keys', { keys: store.keys() }); break;
      case 'remove': store.remove('save.' + (msg.body.key || 'auto')); reply('remove', { ok: true }); break;
      /* a camera is a permission, a scanner is a dependency, and neither is
         wired yet: the honest answer is null, which the game reads as "not
         available here" and does not offer the control that needs it */
      case 'scan': reply('scan', { code: null }); break;
      case 'url': reply('url', { url: WEB_URL }); break;
      case 'canInstall': reply('canInstall', { can: false }); break;
      default: break;
    }
  }, [showToast, store]);

  if (!ready) {
    return (
      <View style={styles.fill}>
        <StatusBar style="light" />
        <ActivityIndicator color="#f5b301" />
        <Text style={styles.hint}>Unpacking the game…</Text>
      </View>
    );
  }
  if (ready.error) {
    return (
      <View style={styles.fill}>
        <StatusBar style="light" />
        <Text style={styles.hint}>The game could not be unpacked.</Text>
        <Text style={styles.small}>{ready.error}</Text>
        <Text style={styles.small}>
          Run `npm run build` at the repository root: it writes the game into
          assets/game/ and the app ships whatever is there.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <StatusBar style="light" backgroundColor="#080b10" />
      <WebView
        ref={web}
        source={{ uri: ready.uri }}
        originWhitelist={['*']}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        javaScriptEnabled
        domStorageEnabled                       /* the game saves through localStorage inside the WebView */
        setSupportMultipleWindows={false}
        onMessage={onMessage}
        onError={(e) => showToast('The game failed to load: ' + (e.nativeEvent.description || ''))}
        style={styles.web}
        /* the page is one dark screen; a white flash between the shell and the
           game is the difference between an app and a web page in a costume */
        containerStyle={{ backgroundColor: '#080b10' }}
      />
      {Platform.OS === 'ios' && <View style={styles.homeGap} />}
      {!!toast && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
      {!booted && <View style={styles.veil} pointerEvents="none" />}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#080b10', alignItems: 'center', justifyContent: 'center' },
  web: { flex: 1, backgroundColor: '#080b10' },
  homeGap: { height: 18, backgroundColor: '#080b10' },
  hint: { color: '#e8eef5', marginTop: 12, fontSize: 14 },
  small: { color: '#8b9bb0', fontSize: 12, marginTop: 8, paddingHorizontal: 28, textAlign: 'center' },
  toast: {
    position: 'absolute', left: 16, right: 16, bottom: 28, borderRadius: 10,
    backgroundColor: 'rgba(20,26,35,0.96)', borderWidth: 1, borderColor: '#22303f', padding: 12
  },
  toastText: { color: '#e8eef5', fontSize: 13 },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: '#080b10' }
});
