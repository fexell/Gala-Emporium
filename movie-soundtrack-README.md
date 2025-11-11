# Movie Soundtrack Orchestra - README

## Översikt
Movie Soundtrack Orchestra är en del av Gala Emporium 2025 projektet. Detta är ett komplett evenemangs- och bokningssystem för filmmusikkonserter som hålls på TUC Matsalen.

## 🎬 Vad systemet gör
- Visar filmmusikkonserter sorterade efter datum
- Låter kunder boka biljetter online
- Ger administratörer full kontroll över events och bokningar
- Uppdaterar biljettstatus i realtid

## 📁 Filstruktur

### HTML
- `movie-soundtrack.html` - Huvudsidan med kunddel och admin-panel

### CSS  
- `movie-soundtrack.css` - All styling för utseendet

### JavaScript
- `movie-soundtrack-main.js` - Kundfunktionalitet och event-visning
- `movie-soundtrack-admin.js` - Admin-funktioner (skapa/ta bort events, se bokningar, kunna radera bokningar)
- `movie-soundtrack-booking.js` - Bokningssystem och formulärhantering

## �️ Säkerhet & Validering

Systemet har inbyggda säkerhetsmekanismer för att förhindra fel:

### Bokningsvalidering
- **Overbooking-skydd**: Kan inte boka fler biljetter än vad som finns tillgängligt
- **Formulärvalidering**: Alla fält måste fyllas i (namn, email, antal biljetter)
- **Event-validering**: Måste välja ett event innan bokning
- **Antal-begränsning**: Minimum 1 biljett (ingen max-gräns efter att vi tog bort HTML max="10")
- **Email-format**: HTML5 email-validering i formuläret

### Admin-säkerhet
- **Bekräftelsedialoger**: "Är du säker?"-meddelanden för borttagning och återbetalning
- **Data-integritet**: Kontrollerar att events finns innan hantering
- **Kategorifiltrering**: Kan bara se och hantera movie-soundtrack events (inte andra klubbars)
- **Real-time synk**: Alla ändringar uppdaterar automatiskt kundsidan

### Fel-hantering
- **Nätverksfel**: Användarvänliga svenska meddelanden vid serverfel
- **JSON-parsing**: Try-catch för alla API-anrop med fallbacks
- **Tom data**: Visa meddelandet "Inga events/bokningar" istället för en tom sida
- **Biljettstatus**: Realtidsuppdatering av tillgängliga biljetter
- **SLUTSÅLT-märkning**: Events utan biljetter markeras och inaktiveras

### Datavalidering
- **Prisformat**: Automatisk parsing till float för priser
- **Datumformat**: ISO-format för korrekt sortering
- **ID-koppling**: Säker koppling mellan bokningar och events via eventId
- **Kategori-konsistens**: Alla nya events får automatiskt "movie-soundtrack" kategori

## �🔧 Teknisk Information

### Databas (db.json)
Systemet använder port **5000** som var inställt sen start vid kloning (VIKTIGT: Ändra inte detta!)

**Events struktur:**
```json
{
  "id": "unikt-id",
  "title": "Event namn",
  "datetime": "2025-12-20T19:30",
  "location": "TUC Matsalen", 
  "description": "Beskrivning...",
  "price": 450,
  "maxTickets": 200,
  "ticketCount": 0,
  "category": "movie-soundtrack",
  "clubId": 2,
  "eventImage": "bild.jpg"
}
```

**Bokningar struktur:**
```json
{
  "id": "booking-id",
  "eventId": "event-id",
  "customerName": "Kundnamn",
  "customerEmail": "email@example.com", 
  "ticketCount": 2,
  "bookingDate": "2025-11-06T...",
  "totalPrice": 900
}
```

## 🎭 Funktioner

### Kundsida
- **Event-visning**: Kronologiskt sorterade filmmusikkonserter
- **Bokningsystem**: Välj event, ange detaljer, boka biljetter
- **Realtidsuppdatering**: Biljettstatus uppdateras automatiskt
- **Smidig UX**: "Boka Biljetter"-knapp scrollar och förifyllar formulär

### Admin-panel (Aktiveras med "Visa Admin")
**Tab 1 - Lägg till event:**
- Formulär för nya filmmusikkonserter
- Automatisk kategorisering som "movie-soundtrack"
- Validering av alla fält

**Tab 2 - Hantera events:**
- Lista alla movie-soundtrack events
- Ta bort events med bekräftelse
- Visa biljettstatus (sålda/totalt)

**Tab 3 - Se bokningar:**
- Visa ENDAST bokningar för movie-soundtrack events
- Kundinformation och bokningsdetaljer
- Återbetalningsfunktion som återställer biljetter

## ⚠️ Viktiga tekniska detaljer

### Port-konfiguration
- Systemet KÖR på port 5000 (ej 3000!)
- package.json och Api.helper.js redan konfigurerade
- ÄNDRA INTE porten - det påverkar hela gruppen

### Datafiltrering
- Alla funktioner filtrerar på `category: "movie-soundtrack"`
- Visar ALDRIG andra klubbars events eller bokningar
- Använder `clubId: 2` för Movie Soundtrack Orchestra

### Realtime-synkronisering
- Admin-ändringar uppdaterar kundsidan automatiskt
- Bokningar uppdaterar event-biljetträknare direkt
- Återbetalningar återställer tillgängliga biljetter

## 🚀 Så här startar du systemet

1. **Starta servern:**
   ```bash
   cd backend
   npm start
   ```
   (Servern startar på http://localhost:5000)

2. **Öppna webbsidan:**
   Öppna `frontend/pages/movie-soundtrack.html` i webbläsare

## 🎪 Test-scenario

1. **Testa kundsida:**
   - Se events sorterade efter datum
   - Klicka "Boka Biljetter" → scrollar till formulär
   - Boka några biljetter → se biljetträknaren minska

2. **Testa admin:**
   - Klicka "Visa Admin"
   - Lägg till nytt event → se det dyka upp på kundsidan
   - Gå till "Se bokningar" → se dina test-bokningar
   - Testa återbetalning → se biljetterna komma tillbaka

## 🤝 För gruppmedlemmar

### Om ni vill bygga vidare:
- Alla våra funktioner börjar med `movie-soundtrack` i namnet
- Vi använder svenska kommentarer genomgående
- Följ samma namnkonvention för nya filer

### Om något inte fungerar:
1. Kolla att servern kör på port 5000
2. Öppna browser dev tools för felmeddelanden
3. Verifiera att db.json inte är trasig (JSON-syntax)

### Integration med andra klubbar:
- Vårt system stör inte andra - vi filtrerar på kategori
- Andre klubbar kan ha egna kategorier utan konflikter
- Shared resources: server (port 5000) och db.json

## 📝 Kodstruktur

### Naming Convention
- Funktioner: `loadCustomerEvents()`, `handleBooking()`
- Variabler: `movieEvents`, `customerName`, `requestedTickets`
- IDs: `movie-soundtrack-[funktion]`

### Error Handling
- Try-catch blocks i alla async-funktioner
- User-friendly felmeddelanden på svenska
- Fallback-meddelanden vid nätverksfel

### Comments Style
```javascript
// Kort beskrivning av vad som händer
const result = complex.operation();

// Längre förklaring för komplicerade delar
// Här förklarar vi varför vi gör något specifikt
// och vad resultatet blir
```

---

**Skapad av:** Movie Soundtrack Orchestra Team  
**Datum:** November 2025  
**Gala Emporium Grupp:** #6  

*"Förvandlar TUC matsal till en magisk konsertsal mellan lunch och middag!"* 🎵