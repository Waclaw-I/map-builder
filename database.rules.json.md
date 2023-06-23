# JAK SKONFIGUROWAĆ REALTIME DATABASE W FIREBASE?
# INSTRUKCJA DLA PROJEKTÓW, KTÓRE MAJĄ WŁASNĄ INSTANCJĘ BAZY DANYCH
# CZYLI TYCH W ODDZIELNYCH, DEDYKOWANYCH PROJEKTACH FIREBASE (jak squars, my-pocket-blacksmith czy memotem).

1. W pliku `firebase.json`, dodajemy klucz "database"
("database" ma sąsiadować z kluczem "hosting", być na jego poziomie zagnieżdżenia):
```
  "database": {
    "rules": "database.rules.json"
  },
```

2. Tworzymy plik `database.rules.json` w root projektu, w bezpośrednim sąsiedztwie do `firebase.json`.
W `database.rules.json` konfigurujemy uprawnienia do bazy danych zgodnie z dokumentacją firebase'a. Przykładowa zawartość:
```
{
  "rules": {
    "gamestates": {
      ".read": "auth.uid != null",
      "$uid": {
        ".write": "auth.uid == $uid"
      }
    }
  }
}
```

3. W pliku `package.json` zmieniamy skrypt `deploy` na (dodajemy parametr `database` do `--only`):
```
  "deploy": "webpack --env env=production && firebase deploy --only database,hosting"
```
