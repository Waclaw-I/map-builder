- Update Browserslist:
```
  Browserslist: caniuse-lite is outdated. Please run:
    npx browserslist@latest --update-db
    Why you should do it regularly: https://github.com/browserslist/browserslist#browsers-data-updating
```

- Coś jak (typeof `PWA_FEATURES`), na wzór (typeof `PLUGIN_FBINSTANT`) w `webpack.config.js`
  do budowania wersji bez service_worker'a i manifest.json na potrzeby np. itch.io!

- PWA icons (./assets/icons + manifest.json + favicon w index.html)!

- FAJNIE BY BYŁO, GDYBY favicons DODAWAĆ Z AUTOMATU:
  bazując na browserlist i https://github.com/itgalaxy/favicons

- `manifest.json` do poprawy klucz `shortcuts`, zgodnie z:
  https://developer.mozilla.org/en-US/docs/Web/Manifest/shortcuts
  UWAGA! Podobno musi być ikona o rozmiarze 96x96!

- `manifest.json` `maskable icons` ewentualnie do dodania, zgodnie z:
  https://web.dev/maskable-icon/

- (?) Wersja gry w każdym tytule, na ekranie opcji.

- VITE - nie warto kodu osadzającego sw injectować do htmla,
  należy wkleić na go stałe - żeby działał na rollup + vite (prod + dev), a nie tylko sam rollup (prod)!


# BŁĘDY W OBECNYM BOILERPLATE!!!!!
1. Czasem na nowym boilerplacie jest też problem, że robi infinite loopa przeładowywania i trzeba ręcznie jeszcze raz odświeżyć 

2. Co jakiś czasu mu nagle z dupy wyskakuje, że mu brakuje audio albo coś innego ;D i się chrome zatyka, pamięć


# WERSJE BOILERPLATE'A W GRACH:
- na dzień 28.09.2022 aktualny boilerplate posiada:
1. squars
2. sunny memory
