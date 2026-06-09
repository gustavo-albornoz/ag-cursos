# Conexiones DBeaver — AG Cursos

## Base de datos LOCAL (Docker)

| Campo | Valor |
|---|---|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `postgres` |
| **Username** | `postgres` |
| **Password** | ver `ag-cursos-backend/.env` → `DATABASE_URL` |

> Requiere tener Docker Desktop corriendo y el container `ag-cursos-db-1` activo (`docker compose up -d`).

---

## Base de datos PRODUCCIÓN (Render)

Los datos de conexión están en:
**Render Dashboard → PostgreSQL → Info → Connections → External Database URL**

La URL tiene el formato:
```
postgresql://USUARIO:PASSWORD@HOST.ohio-postgres.render.com/NOMBRE_DB
```

Desglosada en DBeaver (usar modo **Host**, no URL):

| Campo | Valor |
|---|---|
| **Host** | `dpg-xxxxxxxx-a.ohio-postgres.render.com` |
| **Port** | `5432` |
| **Database** | `ag_cursos_local` |
| **Username** | ver Render → Info |
| **Password** | ver Render → Info |

> **Importante:** no pegar la URL completa en el campo URL de DBeaver — duplica el prefijo `postgresql://` y da error de parsing. Siempre usar los campos individuales en modo Host.

---

## Dump local → importar en Render

**1. Exportar la base local:**
```bash
docker exec -t ag-cursos-db-1 pg_dump -U postgres --data-only --no-owner -f /tmp/dump.sql postgres
docker cp ag-cursos-db-1:/tmp/dump.sql ./dump.sql
```

**2. Limpiar el dump antes de importar:**

Abrí el archivo `dump.sql` en un editor de texto y eliminá las dos líneas que empiezan con `\restrict` y `\unrestrict` (primera y última línea del archivo). Son comandos internos de psql que DBeaver no entiende.

**3. Importar en Render desde DBeaver:**
- Conectate a la base de Render en DBeaver
- Menú superior → **SQL Editor → Open SQL Script** → abrís el `dump.sql` limpio
- Seleccionás la conexión de Render arriba a la izquierda
- Ejecutás con `Ctrl+Alt+X`
