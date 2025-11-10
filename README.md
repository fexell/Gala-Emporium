# Grupp #6 - Set up for success! 🙂
# Gala Emporium - Opera Hall 
# En modern bokningswebbplats för Opera Hall med dynamiska evenemang, bokningssystem och administratörspanel.

## Funktioner

✨ **Single Page Application** - Snabb navigation utan sidladdningar  
🎫 **Bokningssystem** - Boka biljetter till operaföreställningar  
⚙️ **Admin-panel** - Hantera evenemang och bokningar  
📱 **Responsiv design** - Fungerar på alla enheter  
🚀 **Auto-start backend** - Backend startar automatiskt vid projektöppning

## Teknisk Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla - inga ramverk)
- **Backend:** JSON Server (REST API)
- **Databas:** db.json
- **Routing:** Hash-baserad SPA-routing


# 1. Öppna projektet
# Backend startar automatiskt när du öppnar projektet i VS Code.



# Användning

# För användare:
1. Bläddra bland evenemang på startsidan
2. Fyll i bokningsformuläret och boka biljetter
3. Navigera till specifika operasidor via URL (#traviata, #requiem, #operagala)

### För administratörer:
1. Gå till `#admin` (diskret länk i sidfoten)
2. Skapa nya evenemang
3. Ta bort evenemang
4. Visa bokningar
5. Återbetala bokningar

## API Endpoints

- `GET /events` - Hämta alla evenemang
- `GET /events?category=opera` - Filtrera efter kategori
- `POST /events` - Skapa nytt evenemang
- `DELETE /events/:id` - Ta bort evenemang
- `GET /bookings` - Hämta alla bokningar
- `POST /bookings` - Skapa ny bokning
- `DELETE /bookings/:id` - Ta bort bokning

## Brancher

- **`main`** - Produktionsbranch (stabil kod)
- **`dev`** - Utvecklingsbranch
- **`opera-hall`** - Feature branch för Opera Hall funktionalitet



