# Games Directory

Ten folder zawiera wszystkie gry dostępne w GameHUB.

## Struktura

Każda gra ma swój własny folder z następującymi plikami:
- `index.html` - główny plik HTML gry
- `style.css` - style CSS specyficzne dla gry
- `script.js` - logika JavaScript gry
- `README.md` - dokumentacja gry (opcjonalnie)

## Dostępne gry

### ✅ Mastermind
- **Folder:** `mastermind/`
- **Status:** Gotowa
- **Opis:** Gra logiczna polegająca na złamaniu tajnego kodu

### 🚧 Snake Classic
- **Folder:** `snake/`
- **Status:** W przygotowaniu
- **Opis:** Klasyczna gra Snake

### 🚧 Tetris
- **Folder:** `tetris/`
- **Status:** W przygotowaniu
- **Opis:** Kultowa gra logiczna z klockami

### 🚧 Memory Game
- **Folder:** `memory/`
- **Status:** W przygotowaniu
- **Opis:** Gra na pamięć z kartami

## Dodawanie nowych gier

1. Stwórz nowy folder w `games/`
2. Dodaj pliki `index.html`, `style.css`, `script.js`
3. Zaktualizuj `loadGame()` w głównym `script.js`
4. Dodaj kartę gry w `index.html`

## Wymagania dla gier

- Każda gra musi mieć przycisk "Powrót do GameHUB"
- Style powinny być responsywne
- Gra powinna działać w iframe (modal)
- Kod powinien być czysty i dobrze udokumentowany
